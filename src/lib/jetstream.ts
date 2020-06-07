/* tslint:disable:variable-name */

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { IEvent, IEventPublisher, EventBus, IMessageSource } from '@nestjs/cqrs'
import { Subject } from 'rxjs'
import { v4 } from 'uuid'
import {
  IEventConstructors,
  ProvidersConstants,
  IEventStoreMessage,
} from './contract'
import { NestjsJetstream } from './nestjs-jetstream.class'

/**
 * @class Jetstream
 */
@Injectable()
export class Jetstream
  implements IEventPublisher, OnModuleDestroy, OnModuleInit, IMessageSource {
  private logger = new Logger(this.constructor.name)
  private jetstream: NestjsJetstream
  private eventHandlers: IEventConstructors
  private subject$: Subject<IEvent>
  private readonly featureSubjectPrefix?: string

  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) jetstream: any,
    @Inject(ProvidersConstants.JETSTREAM_CONNECTION_CONFIG_PROVIDER)
    configService: any,
    @Inject(ProvidersConstants.JETSTREAM_STREAM_CONFIG_PROVIDER)
    jetstreamStreamConfig: any,
    private readonly eventsBus: EventBus,
  ) {
    this.jetstream = jetstream
    this.featureSubjectPrefix = jetstreamStreamConfig.featureSubjectPrefix
    this.addEventHandlers(jetstreamStreamConfig.eventHandlers)
    this.jetstream.connect(configService.options)

    const subjectSubscriptions = jetstreamStreamConfig.subscriptions

    this.subscribeSubjects(subjectSubscriptions)
  }

  async sendAck(id: string) {
    try {
      await this.jetstream.getConnection().publish(id)
    } catch (err) {
      this.logger.error(err)
    }
  }

  async publish(event: IEvent, stream?: string) {
    if (event === undefined) {
      return
    }
    if (event === null) {
      return
    }

    const eventType = event.constructor.name
    const subjectPrefix = this.featureSubjectPrefix
    const publishTo = `${subjectPrefix}.${eventType}`

    const eventPayload: IEventStoreMessage = {
      subjectPrefix,
      created: new Date(),
      eventId: v4(),
      eventNumber: 0,
      eventType,
      eventData: event,
    }

    try {
      await this.jetstream
        .getConnection()
        .publish(publishTo, JSON.stringify(eventPayload))
    } catch (err) {
      this.logger.error(err)
    }
  }

  async subscribeSubjects(subjects) {
    await Promise.all(
      subjects.map(async subject => {
        return await this.subscribeSubject(subject.subject)
      }),
    )
  }

  async subscribeSubject(subject: string): Promise<any> {
    try {
      this.logger.log(`
        Subscribing ${subject}!
      `)

      const resolved = await this.jetstream
        .getConnection()
        .subscribe(subject, (payload, ack, eventType) =>
          this.onEvent(payload, ack, eventType),
        )

      resolved.isLive = true

      return resolved
    } catch (err) {
      this.logger.error(err.message)
    }
  }

  async onEvent(payload: any, replyTo: string, eventType: any) {
    payload = JSON.parse(payload)

    const handler = this.eventHandlers[eventType]
    if (!handler) {
      this.logger.error(
        `Received event ${eventType} that could not be handled!`,
      )
      return
    }

    const rawData = payload.eventData
    const data = Object.values(rawData)

    const ack = async () => await this.sendAck(replyTo)

    if (this.eventHandlers && this.eventHandlers[eventType]) {
      this.subject$.next(this.eventHandlers[eventType](data, ack, payload))
    } else {
      Logger.warn(
        `Event of type ${eventType} not handled`,
        this.constructor.name,
      )
    }
  }

  onDropped(consumer, _reason: string, error: Error) {
    consumer.isLive = false
    this.logger.error('onDropped => ' + error)
  }

  get isLive(): boolean {
    return true
  }

  addEventHandlers(eventHandlers: IEventConstructors) {
    this.eventHandlers = { ...this.eventHandlers, ...eventHandlers }
  }
  onModuleInit(): any {
    this.subject$ = (this.eventsBus as any).subject$
    this.bridgeEventsTo((this.eventsBus as any).subject$)
    this.eventsBus.publisher = this
  }

  onModuleDestroy(): any {
    this.jetstream.close()
  }

  async bridgeEventsTo<T extends IEvent>(subject: Subject<T>): Promise<any> {
    this.subject$ = subject
  }
}

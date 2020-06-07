import { Logger } from '@nestjs/common'
import NATS from 'nats'

/**
 * @description NATS setup from https://github.com/nats-io/nats.js
 */
export class NestjsJetstream {
  [x: string]: any
  private logger: Logger = new Logger(this.constructor.name)
  private connection: any
  public isConnected: boolean

  constructor() {
    this.type = 'nats-jetstream'
  }

  connect(options: any) {
    try {
      this.connection = NATS.connect(options)

      this.connection.on('connect', () => {
        this.isConnected = true
        this.logger.log('NATS connected!')
      })
      this.connection.on('closed', () => {
        this.isConnected = false
        this.logger.error('NATS closed!')
        this.connect(options)
      })

      return this
    } catch (e) {
      this.logger.error(e)
      throw new Error(e)
    }
  }

  getConnection() {
    return this.connection
  }

  /**
   * Close NATS connection
   */
  close() {
    this.connection.close()
    return this
  }
}

import { DynamicModule, Module } from '@nestjs/common'
import { JetstreamCoreModule } from './jetstream-core.module'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
  imports: [CqrsModule],
})
export class JetstreamModule {
  static register(option: any): DynamicModule {
    return {
      module: JetstreamModule,
      imports: [JetstreamCoreModule.register(option)],
    }
  }

  static registerFeature(config: any): DynamicModule {
    return {
      module: JetstreamModule,
      imports: [JetstreamCoreModule.registerFeature(config)],
    }
  }
}

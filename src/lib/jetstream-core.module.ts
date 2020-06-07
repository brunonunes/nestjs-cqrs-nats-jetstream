import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common'
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service'
import { Jetstream } from './jetstream'
import { NestjsJetstream } from './nestjs-jetstream.class'
import { CqrsModule } from '@nestjs/cqrs'
import { ProvidersConstants } from './contract'

@Global()
@Module({
  imports: [CqrsModule],
})
export class JetstreamCoreModule {
  static register(option: any): DynamicModule {
    const jetstreamProviders = {
      provide: ProvidersConstants.JETSTREAM_PROVIDER,
      useFactory: (): any => {
        return new NestjsJetstream()
      },
    }

    const configProv = {
      provide: ProvidersConstants.JETSTREAM_CONNECTION_CONFIG_PROVIDER,
      useValue: {
        ...option,
      },
    }

    return {
      module: JetstreamCoreModule,
      providers: [jetstreamProviders, configProv],
      exports: [jetstreamProviders, configProv],
    }
  }

  static registerFeature(config: any): DynamicModule {
    if (config === undefined || config === null) {
      throw new Error('Config missing')
    }

    return {
      module: JetstreamCoreModule,
      providers: [
        ExplorerService,
        {
          provide: ProvidersConstants.JETSTREAM_STREAM_CONFIG_PROVIDER,
          useValue: {
            ...config,
          },
        },
        Jetstream,
      ],
      exports: [Jetstream, ExplorerService],
    }
  }
}

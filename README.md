<h1  align="center">
NestJS CQRS NATS Jetstream
</h1>

<p  align="center">
NestJS CQRS module for NATS. It requires @nestjs/cqrs.
</p>

<p  align="center">
<a  href="https://www.npmjs.com/package/@brunonunes/nestjs-cqrs-nats-jetstream"  target="_blank"><img  src="https://img.shields.io/npm/v/@brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="NPM Version"/></a>
<a  href="https://img.shields.io/npm/l/@brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  target="_blank"><img  src="https://img.shields.io/npm/l/@brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="License"/></a>
<a  href="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square"  target="_blank"><img  src="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square"  alt="Code Size"/></a>
<a  href="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square"  target="_blank"><img  src="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square"  alt="Top Language"/></a>
<a  href="https://img.shields.io/codacy/grade/0944a2f07aca403da4d4637606af7478?style=flat-square"  target="_blank"><img  src="https://img.shields.io/codacy/grade/dc460840375d4ac995f5647a5ed10179?style=flat-square"  alt="Top Language"/></a>
</p>

  
## Installation
```bash
$ yarn install @brunonunes/nestjs-cqrs-nats-jetstream
```


## Description
This module enable NestJS CQRS to work with [NATS JetStream]([https://github.com/nats-io/jetstream](https://github.com/nats-io/jetstream)).


## Setup root app module
```typescript
import { Module } from  '@nestjs/common';
import { JetstreamModule } from  '@brunonunes/nestjs-cqrs-nats-jetstream';

@Module({
	imports: [
		JetstreamModule.register()
	]
})

export  class  AppModule {}
```

## Setup module

### Setup feature module

```typescript
import { Module } from  '@nestjs/common';
import { 
  CommandBus, 
  CqrsModule, 
  EventBus 
} from  '@nestjs/cqrs';
import { 
  JetstreamModule,
  Jetstream, 
  JetstreamSubscriptionType 
} from  '@brunonunes/nestjs-cqrs-nats-jetstream';
import {
  UserCommandHandlers,
  UserCreatedEvent,
  UserEventHandlers,
  UserQueryHandlers,
} from  '../cqrs';

@Module({
  imports: [
    CqrsModule,
    JetstreamModule.registerFeature({
      featureStreamName: 'USER',
      subscriptions: [
        {
          name: "con-user-service"
        },
      ],
      eventHandlers: {
        UserLoggedInEvent: (data) => new UserLoggedInEvent(data),
        UserRegisteredEvent: (data) => new UserRegisteredEvent(data),
        EmailVerifiedEvent: (data) => new EmailVerifiedEvent(data),
      },
    }),
  ],
  providers: [
    ...UserQueryHandlers,
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})

export  class  UserModule {}
```

## License

This project is [MIT licensed](LICENSE).

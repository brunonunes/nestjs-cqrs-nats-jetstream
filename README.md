<h1  align="center">
NestJS CQRS NATS Jetstream
</h1>

<p  align="center">
NestJS CQRS module for NATS JetStream. It requires @nestjs/cqrs.
</p>

<p  align="center">
<a  href="https://www.npmjs.com/package/nestjs-cqrs-nats-jetstream"  target="_blank"><img  src="https://img.shields.io/npm/v/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="NPM Version"/></a>
<a  href="https://img.shields.io/npm/l/nestjs-cqrs-nats-jetstream?style=flat-square"  target="_blank"><img  src="https://img.shields.io/npm/l/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="License"/></a>
<a  href="https://img.shields.io/github/languages/code-size/brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  target="_blank"><img  src="https://img.shields.io/github/languages/code-size/brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="Code Size"/></a>
<a  href="https://img.shields.io/github/languages/top/brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  target="_blank"><img  src="https://img.shields.io/github/languages/top/brunonunes/nestjs-cqrs-nats-jetstream?style=flat-square"  alt="Top Language"/></a>
</p>

  
## Installation
```bash
$ yarn install nestjs-cqrs-nats-jetstream
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

## Setup

### Setup NATS JetStream

Create a stream by configuring the subject with a wildcard. Your events will be published with the ```featureSubjectPrefix```, something like ```USER.UserLoggedInEvent```. Thus, all events published by the module will be sent to that stream.
```bash
$ nats stream add
? Stream Name USER
? Subjects to consume USER.*
? ...
```

You now need to create one or more consumers. The module can subscribe to one or more, do as you see fit. The name of the consumer makes no difference to the handlers, we only need the delivery target to subscribe.
```bash
$ nats consumer add
? Consumer name USER-SERVICE
? Delivery target CONSUMER-user-service
? ...
```

### Setup feature module

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JetstreamModule } from 'nestjs-cqrs-nats-jetstream';
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
      featureSubjectPrefix: 'USER', // Events will be published with this prefix.
      subscriptions: [
        {
          name: "CONSUMER-user-service" // Insert the consumer delivery target
        },
      ],
      eventHandlers: {
        "USER.UserLoggedInEvent": (data, ack, raw) => new UserLoggedInEvent(data, ack, raw),
        "USER.UserRegisteredEvent": (data, ack, raw) => new UserRegisteredEvent(data, ack, raw),
        "USER.EmailVerifiedEvent": (data, ack, raw) => new EmailVerifiedEvent(data, ack, raw),
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

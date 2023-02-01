# Installation
```
npm i @mistercoookie/nestjs-redis-pub-sub
```

# Usages
Import the module inside the modules you need :

```
import { RedisModule } from '@mistercoookie/nestjs-redis-pub-sub'

@Module({
    import: [RedisModule]
})
```

# Subscription

```
import { RedisService, RedisPublication } from '@mistercoookie/nestjs-redis-pub-sub'

@Controller()
export class YourController {

    constructor(
        private redisService: RedisService,
    ) {
        this.redisService.subscribeChannel('Your Channel', (redisPublication: RedisPublication) => {
            this.onYourChannel(redisPublication)
        })
    }

    onYourChannel(redisPublication) {
        // Your Logic
    }
}
```
> Make sure the ```RedisModule``` is imported in the same module of the controller

# Publication

```
import { RedisService } from '@mistercoookie/nestjs-redis-pub-sub'

@Controller()
export class YourController {

    constructor(
        private redisService: RedisService,
    ) {}

    @Post()
    yourEndpoint(data) {
        this.redisService.publish('Your Channel', 'Some Data')
    }
}
```
> Make sure the ```RedisModule``` is imported in the same module of the controller

# Publication with needed response

## Publisher

```
import { RedisService } from '@mistercoookie/nestjs-redis-pub-sub'

@Controller()
export class YourController {

    constructor(
        private redisService: RedisService,
    ) {}

    @Post()
    async yourEndpoint(data) {
        const answer = await this.redisService.publishWithAnswer('Your Channel', 'Some Data')
    }
}
```
> Make sure the ```RedisModule``` is imported in the same module of the controller

## Subscriber

```
import { RedisService, RedisPublication } from '@mistercoookie/nestjs-redis-pub-sub'

@Controller()
export class YourController {

    constructor(
        private redisService: RedisService,
    ) {
        this.redisService.subscribeChannel('Your Channel', (redisPublication: RedisPublication) => {
            this.onYourChannel(redisPublication)
        })
    }

    onYourChannel(redisPublication: RedisPublication) {
        // Your Logic
        if (redisPublication.expectingAnswer) {
            this.redisService.publish(daredisPublicationta.answerChannel, answerData)
        }
    }
}
```

# Author
ELISABETH Nathanaël
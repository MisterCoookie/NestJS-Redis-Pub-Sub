# Installation
```
npm i @mistercoookie/nestjs-redis-pub-sub
```

# Initialization

```ts
import { RedisService } from '@mistercoookie/nestjs-redis-pub-sub'
RedisService.initService("<yout-redis url>")
```

# Subscription

```ts
import { RedisService, RedisPublication } from '@mistercoookie/nestjs-redis-pub-sub'

RedisService.subscribeChannel(
    'Your Channel',
    (redisPublication: RedisPublication) => {
        // Your logic
    }
)
```

# Publication

```ts
import { RedisService } from '@mistercoookie/nestjs-redis-pub-sub'

RedisService.publish('Your Channel', 'Some Data')
```

# Publication with needed response

## Publisher

```ts
import { RedisService } from '@mistercoookie/nestjs-redis-pub-sub'

async function yourFunction(
    const answer = await RedisService.publishWithAnswer(
        'Your Channel',
        'Some Data'
    )
)
```

## Subscriber
```ts
import { RedisService, RedisPublication } from '@mistercoookie/nestjs-redis-pub-sub'

onYourChannel(redisPublication: RedisPublication) {
    // Your Logic
    if (redisPublication.expectingAnswer) {
        RedisService.publish(
            daredisPublicationta.answerChannel,
            answerData
        )
    }
}

RedisService.subscribeChannel(
    'Your Channel',
    (redisPublication: RedisPublication) => {
        this.onYourChannel(redisPublication)
    }
)
```

# Author
ELISABETH Nathanaël
import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {createClient} from "redis";
import { v4 } from 'uuid';
import {RedisPublication} from "./redisPublication/redisPublication.class";
@Injectable()
export class RedisService {
  private logger: Logger = new Logger('RedisService')

  private _client

  private subscribers: {[channel: string]: any} = {}
  get client() {
    return this._client
  }
  constructor(
    private configService: ConfigService
  ) {
    this._client = createClient({
      url: configService.get('REDIS_URL')
    })

    this._client.on('error', (err) => {
      this.logger.error('Redis Client Error', err)
    });

    this._client.connect().then(() => {
      this.logger.log('Connected')
    })
  }

  /**
   * @param channel { string } Name of the channem
   * @param callback { Function } Function that will be called when the channel receive a publication
   */
  subscribeChannel(channel: string, callback) {
    if (this.subscribers.hasOwnProperty(channel)) {
      throw new Error('The channel is already subscribed')
    }
    this.subscribers[channel] = this._client.duplicate()
    this.subscribers[channel].connect().then(() => {
      this.subscribers[channel].subscribe(channel, (message) => {
        callback(new RedisPublication(JSON.parse(message)));
      })
    })
  }
  
  /**
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   */
  publish(channel: string, content: string) {
    const publication = new RedisPublication({publishedData: content})
    this.client.publish(channel, publication.export)
  }

  /**
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   * @param timeout { number } A timeout for a response ( in ms ), default 10000 ms
   * @returns The answer of the requested information
   */
  publishWithAnswer(channel: string, content: string, timeout: number = 10000) {
    return new Promise((resolve, reject) => {
      const subChannel = v4() + "_" + channel
      console.log(`Channel: ${subChannel}`)
      this.subscribeChannel(subChannel ,(redisPublication: RedisPublication) => {
        resolve(redisPublication.publishedData)
      })

      setTimeout(() => {
        reject('AnswerTimeout')
      }, timeout)

      console.log(`Channel: ${channel}`)
      console.log(`Channel: ${content}`)
      const publication = new RedisPublication({publishedData: content, answerChannel: subChannel})
      this.client.publish(channel, publication.export)
    })
  }
}
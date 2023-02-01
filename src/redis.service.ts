/**
 * CREATED AT: 2023-02-01
 * UPDATED AT: 2023-02-01 
 * 
 * AUTHOR: ELISABETH Nathanaël
 */
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
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param callback { Function } Function that will be called when the channel receive a publication
   */
  subscribeChannel<T>(channel: string, callback) {
    if (this.subscribers.hasOwnProperty(channel)) {
      throw new Error('The channel is already subscribed')
    }
    this.subscribers[channel] = this._client.duplicate()
    this.subscribers[channel].connect().then(() => {
      this.subscribers[channel].subscribe(channel, (message) => {
        callback(new RedisPublication<T>(JSON.parse(message)));
      })
    })
  }
  
  /**
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   */
  publish<T>(channel: string, content: T) {
    const publication = new RedisPublication<T>({publishedData: content})
    this.client.publish(channel, publication.export)
  }

  /**
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   * @param timeout { number } A timeout for a response ( in ms ), default 10000 ms
   * @returns The answer of the requested information
   */
  publishWithAnswer<C, R>(channel: string, content: C, timeout: number = 10000) {
    return new Promise((resolve, reject) => {
      const subChannel = v4() + "_" + channel

      this.subscribeChannel(subChannel ,(redisPublication: RedisPublication<C>) => {
        resolve(redisPublication.publishedData)
      })

      setTimeout(() => {
        reject('AnswerTimeout')
      }, timeout)

      const publication = new RedisPublication<R>({publishedData: content, answerChannel: subChannel})
      this.client.publish(channel, publication.export)
    })
  }
}
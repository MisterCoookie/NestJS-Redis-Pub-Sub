/**
 * CREATED AT: 2023-02-01
 * UPDATED AT: 2023-02-01 
 * 
 * AUTHOR: ELISABETH Nathanaël
 */
import { createClient } from "redis";
import { v4 } from 'uuid';
import { RedisPublication } from "./redisPublication.class";

export class RedisService {

  private static instance: RedisService | null = null
  private _client

  private subscribers: {[channel: string]: any} = {}
  get client() {
    return this._client
  }
  constructor(
    redisUrl: string
  ) {
    this._client = createClient({
      url: redisUrl
    })

    this._client.on('error', (err: any) => {
      console.warn('Redis Client Error', err)
    });

    this._client.connect().then(() => {
      console.log('Connected')
    })
  }

  public static initService(redisUrl: string){
    RedisService.instance = new RedisService(redisUrl)
  }

  /**
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param callback { Function } Function that will be called when the channel receive a publication
   */
  static subscribeChannel<T>(channel: string, callback) {
    if(RedisService.instance == null) {
      throw new Error('Redis service must be ignited')
    }

    if (RedisService.instance.subscribers.hasOwnProperty(channel)) {
      throw new Error('The channel is already subscribed')
    }
    RedisService.instance.subscribers[channel] = RedisService.instance._client.duplicate()
    RedisService.instance.subscribers[channel].connect().then(() => {
        RedisService.instance!.subscribers[channel].subscribe(channel, (message: string) => {
            callback(new RedisPublication<T>(JSON.parse(message)));
        })
    })
  }
  
  /**
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   */
  static publish<T>(channel: string, content: T) {
    if(RedisService.instance == null) {
      throw new Error('Redis service must be ignited')
    }

    const publication = new RedisPublication<T>({publishedData: content})
    RedisService.instance.client.publish(channel, publication.export)
  }

  /**
   * @author ELISABETH Nathanaël
   * @param channel { string } Name of the channem
   * @param content { string } Content, should be a string as redis only allow String for Pub Sub
   * @param timeout { number } A timeout for a response ( in ms ), default 10000 ms
   * @returns The answer of the requested information
   */
  static publishWithAnswer<C, R>(channel: string, content: C, timeout: number = 10000) {
    if(RedisService.instance == null) {
      throw new Error('Redis service must be ignited')
    }

    return new Promise((resolve, reject) => {
      const subChannel = v4() + "_" + channel

      RedisService.subscribeChannel(subChannel ,(redisPublication: RedisPublication<C>) => {
        resolve(redisPublication.publishedData)
        delete RedisService.instance!.subscribers[subChannel]
      })

      setTimeout(() => {
        reject('AnswerTimeout')
      }, timeout)

      const publication = new RedisPublication<R>({publishedData: content, answerChannel: subChannel})
      RedisService.instance!.client.publish(channel, publication.export)
    })
  }
}
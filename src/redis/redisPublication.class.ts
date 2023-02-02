/**
 * CREATED AT: 2023-02-01
 * UPDATED AT: 2023-02-01 
 * 
 * AUTHOR: ELISABETH Nathanaël
 */

import { RedisPublicationDto } from "./redisPublicationDto";

export class RedisPublication<T> {

  private _publishedData: T;
  private _answerChannel: string | undefined;

  constructor(redisPublicationDto: RedisPublicationDto) {
    this._publishedData = redisPublicationDto.publishedData
    this._answerChannel = redisPublicationDto.answerChannel;
  }

  get expectingAnswer(): boolean {
    return this._answerChannel != undefined
  }

  get publishedData(): T {
    return this._publishedData
  }

  get answerChannel(): string {
    return this._answerChannel!
  }

  /**
   * @returns { string } return stringified publication
   */
  get export (): string {
    const exportData: any = {
      publishedData: this.publishedData
    }

    if(this.expectingAnswer) {
      exportData["answerChannel"] = this.answerChannel
    }
    
    return JSON.stringify(exportData)
  }
}
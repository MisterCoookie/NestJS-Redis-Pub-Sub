import {RedisPublicationDto} from "./redisPublication.dto";

export class RedisPublication {

  private _publishedData: string;
  private _answerChannel: string | undefined;

  constructor(redisPublicationDto: RedisPublicationDto) {
    this._publishedData = redisPublicationDto.publishedData
    this._answerChannel = redisPublicationDto.answerChannel;
  }

  get expectingAnswer(): boolean {
    return this._answerChannel != undefined
  }

  get publishedData(): string {
    return this._publishedData
  }

  get answerChannel(): string {
    return this._answerChannel
  }

  get export () {
    const exportData = {
      publishedData: this.publishedData
    }

    if(this.expectingAnswer) {
      exportData["answerChannel"] = this.answerChannel
    }

    console.log(exportData)
    console.log(JSON.stringify(exportData))

    return JSON.stringify(exportData)
  }
}
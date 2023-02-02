/**
 * CREATED AT: 2023-02-01
 * UPDATED AT: 2023-02-01 
 * 
 * AUTHOR: ELISABETH Nathanaël
 */
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {RedisService} from "./redis.service";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}
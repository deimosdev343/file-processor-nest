import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OPENAI_CLIENT } from './open-ai.constants';


@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide:OPENAI_CLIENT,
      inject:[ConfigService],
      useFactory: (config: ConfigService): OpenAI => new OpenAI({
        apiKey: config.getOrThrow<string>("OPEN_AI_KEY"),
        maxRetries: 3,
        timeout: 60_000
      })
    }
  ],
  exports:[OPENAI_CLIENT]
})

export class OpenAiModule {}

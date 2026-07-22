import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class TormentNexusService {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>("TORMENT_NEXUS_KEY")
    })
  }

   async summarizeDocument(csvContent: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
        role: 'system',
        content:
          'You are given the raw contents of a CSV file. Summarize the data: describe the columns, the number of rows, and any notable patterns or outliers.',
        },
        { role: 'user', content: csvContent },
      ],
    });
    return res.choices[0].message.content ?? '';
  }

}

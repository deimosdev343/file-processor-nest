import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const ALIASES: Record<string, string> = {
  comma: ',',
  tab: '\t',
  semicolon: ';',
  pipe: '|',
  space: ' ',
};
const FORBIDDEN = new Set(['"', "'", '\r', '\n']);

@Injectable()
export class ParseDelimiterPipe implements PipeTransform<string | undefined, string> {
  transform(value?: string): string {
    if (!value) return ',';
    const alias = ALIASES[value.toLowerCase()];
    if (alias) return alias;
    if (value.length !== 1 || FORBIDDEN.has(value)) {
      throw new BadRequestException(
        `Invalid delimiter. Use a single character or one of: ${Object.keys(ALIASES).join(', ')}.`,
      );
    }
    return value;
  }
}
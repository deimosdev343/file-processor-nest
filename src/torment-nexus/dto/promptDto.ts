import { IsString, MinLength } from "class-validator";

export class PromptDto {
  @IsString()
  @MinLength(1)
  prompt: string
}
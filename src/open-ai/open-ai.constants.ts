/**
 * Injection token for the shared OpenAI client.
 *
 * Kept in its own file so consumers can import the token without importing
 * openai.module.ts — avoids needless coupling and any chance of a cycle.
 */
export const OPENAI_CLIENT = Symbol('OPENAI_CLIENT');
 

import * as Winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

export interface Logger {
  log(level: LogLevel, ...args: any[]): any;
};

export function createDefaultWinstonLogger(level: LogLevel = 'info'): Winston.LoggerInstance {
  return new Winston.Logger({
    level,
    transports: [
      new Winston.transports.Console()
    ]
  });
}

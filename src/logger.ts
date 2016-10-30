import * as Winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

export interface Logger {
  level: string;
  log(level: LogLevel, ...args: any[]): any;
};

export function createDefaultWinstonLogger(level: LogLevel = 'info'): Logger {
  return new Winston.Logger({
    level: level,
    transports: [
      new Winston.transports.Console()
    ]
  });
}

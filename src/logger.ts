import * as Winston from 'winston';

export type LogLevel = Winston.NPMLoggingLevel;

export const logLevels: LogLevel[] = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];

export interface Logger {
  level: string;
  log(level: LogLevel, ...args: any[]): any;
};

export function createDefaultWinstonLogger(level: LogLevel = 'info'): Logger {
  return new Winston.Logger({
    level,
    transports: [
      new Winston.transports.Console()
    ]
  });
}

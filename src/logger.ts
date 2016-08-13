export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Logger {
  log(level: LogLevel, ...args: any[]): any;
};

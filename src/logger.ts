export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Logger {
  log(level: LogLevel, ...args: any[]): any;
};

// XXX: it is probably just best to export the logger interface as it satisfies all types below
//export type XanaduLogger = Console | Winston.LoggerStatic | Winston.LoggerInstance | Logger;

import pino from 'pino';
//it creates one shared logger for the entire app
import { env, isProduction, isTest } from './env';

export const logger = pino({
  level: isTest ? 'silent' : env.LOG_LEVEL,
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname,req.id,responseTime',
        },
      },
});

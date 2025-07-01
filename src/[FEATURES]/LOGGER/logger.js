import winston from 'winston';
import chalk from 'chalk';
import path from 'path';
import { exec } from 'child_process';

let loggerInstance = null;

export async function setupLogger() {
    if (loggerInstance) return loggerInstance;
    
    const logger = winston.createLogger({
        levels: {
            success: 0, debug: 1, info: 2,
            warn: 3, error: 4, critical: 5
        },
        format: winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, caller }) => {
                const colors = {
                    success: chalk.hex('#00FF00'),  
                    debug: chalk.hex('#808080'),    
                    info: chalk.hex('#00008B'),     
                    warn: chalk.hex('#FFFF00'),  
                    error: chalk.hex('#FF0000'),    
                    critical: chalk.hex('#FF00FF')  
                };
                
                return `${colors[level](`[${level.toUpperCase()}]`)} ${chalk.hex('#808080')(`[${timestamp}]`)} ${message}`;
            })
        ),
        transports: [new winston.transports.Console()]
    });

    // Cria wrapper para cada nível de log
    const loggerWrapper = {};
    Object.keys(logger.levels).forEach(level => {
        loggerWrapper[level] = (message) => {
            const stack = new Error().stack;
            const callerLine = stack.split('\n')[2];
            let caller = 'remoteChrome';
            
            if(callerLine) {
                const match = callerLine.match(/src[\\/](.+?)\.[j|t]s/);
                if(match) {
                    caller = match[1];
                }
            }
            
            logger[level]({ message, caller });
        };
    });

    loggerInstance = loggerWrapper;
    return loggerWrapper;
}

export function getLogger() {
    return loggerInstance;
}
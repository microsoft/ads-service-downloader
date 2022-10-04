/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Events, LogLevel } from "./interfaces";

export interface ILogger {
    verbose(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    critical(message: string): void;
}

export class Logger implements ILogger {
    constructor(private eventEmitter: EventEmitter) { }
    verbose(message: string): void {
        this.log(LogLevel.Verbose, message);
    }
    info(message: string): void {
        this.log(LogLevel.Information, message);
    }
    warn(message: string): void {
        this.log(LogLevel.Warning, message);
    }
    error(message: string): void {
        this.log(LogLevel.Error, message);
    }
    critical(message: string): void {
        this.log(LogLevel.Critical, message);
    }
    log(level: LogLevel, message: string): void {
        this.eventEmitter.emit(Events.LOG_EMITTED, level, message);
    }
}

export class ConsoleLogger implements ILogger {
    verbose(message: string): void {
        console.log(message);
    }
    info(message: string): void {
        console.info(message);
    }
    warn(message: string): void {
        console.warn(message);
    }
    error(message: string): void {
        console.error(message);
    }
    critical(message: string): void {
        console.error(message);
    }
}

import { EventEmitter, Injectable } from '@angular/core';

enum DebugLevel {
    Off = 'off',
    Info = 'info',
    Warning = 'warn',
    Error = 'error'
}

export interface DebugLogEvent {
    level: DebugLevel;
    objects: any[];
}

@Injectable({ providedIn: 'root' })
export class Debugger {
    private logEmitter = new EventEmitter<DebugLogEvent>();

    get watchLogs() {
        return this.logEmitter.asObservable();
    }

    /**
     * Logs messages or objects with the info level.
     * Works the same as console.info().
     */
    info(...objects: any[]) {
        this._log(DebugLevel.Info, objects);
    }

    /**
     * Logs messages or objectswith the warning level.
     * Works the same as console.warning().
     */
    warn(...objects: any[]) {
        this._log(DebugLevel.Warning, objects);
    }

    /**
     * Logs messages or objects with the error level.
     * Works the same as console.error().
     */
    error(...objects: any[]) {
        this._log(DebugLevel.Error, objects);
    }

    private _log(level: DebugLevel, objects: any[]) {
        if (level == DebugLevel.Off) return;

        const log = this.buildLogParts(objects);

        if (level == DebugLevel.Info) console.info(...log);
        else if (level == DebugLevel.Warning) console.warn(...log);
        else if (level == DebugLevel.Error) console.error(...log);

        this.logEmitter.emit({
            level,
            objects
        });
    }

    private buildLogParts(objects: any[]): string[] {
        const now = new Date();

        const nowStr = 'HH:MM:SS'
            .replace('HH', now.getHours().toString().padStart(2, '0'))
            .replace('MM', now.getMinutes().toString().padStart(2, '0'))
            .replace('SS', now.getSeconds().toString().padStart(2, '0'));

        let log = [`[${nowStr}]`];

        log = [...log, ...objects];

        return log;
    }
}

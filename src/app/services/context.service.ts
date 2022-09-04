import { Logger, LogLevel } from '../logger';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const logger = new Logger({
    source: 'ContextService',
    level: LogLevel.Off
});

@Injectable({ providedIn: 'root' })
export class ContextService {
    constructor() {}

    private readonly qrImgSrcSubject = new BehaviorSubject<string>(null);
    qrImgSrc = {
        get: () => this.qrImgSrcSubject.value,
        set: (value: string) => this.qrImgSrcSubject.next(value),
        watch: () => this.qrImgSrcSubject.asObservable()
    };
}
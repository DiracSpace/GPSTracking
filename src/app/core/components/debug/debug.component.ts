import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { disposeSubscription } from 'src/app/utils/angular';
import { Debugger, DebugLevel, DebugLogEvent } from './debugger.service';

@Component({
    selector: 'app-debug',
    templateUrl: './debug.component.html',
    styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, OnDestroy {
    logEvents: DebugLogEvent[] = [];
    showLogsContainer = true;

    private _logsSubs: Subscription;

    private readonly _logColors = new Map<DebugLevel, string>([
        [DebugLevel.Info, 'primary'],
        [DebugLevel.Warning, 'warning'],
        [DebugLevel.Error, 'danger']
    ]);

    constructor(private logger: Debugger) {}

    ngOnInit() {
        this._logsSubs = this.logger.watchLogs.subscribe((log) => {
            this.logEvents.push(log);
        });
    }

    ngOnDestroy(): void {
        disposeSubscription(this._logsSubs);
    }

    get logs(): string[] {
        return this.logEvents.map((log) => {
            const logsJoined = log.objects.join(' ');
            return `[${log.level}] ${logsJoined}`;
        });
    }

    onClearClicked() {
        this.logEvents = [];
    }

    onToggleClicked() {
        this.showLogsContainer = !this.showLogsContainer;
    }

    getLogColor(log: DebugLogEvent): string {
        return this._logColors.get(log.level);
    }

    getLogDescription(log: DebugLogEvent): string {
        const logsJoined = log.objects.join(' ');
        return logsJoined;
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { disposeSubscription } from 'src/app/utils/angular';
import { Debugger, DebugLogEvent } from './debugger.service';

@Component({
    selector: 'app-debug',
    templateUrl: './debug.component.html',
    styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, OnDestroy {
    private logEvents: DebugLogEvent[] = [];
    private logsSubs: Subscription;

    constructor(private debug: Debugger) {}

    ngOnInit() {
        this.logsSubs = this.debug.watchLogs.subscribe((log) => {
            this.logEvents.push(log);
        });
    }

    ngOnDestroy(): void {
        disposeSubscription(this.logsSubs);
    }

    get logs(): string[] {
        return this.logEvents.map((log) => {
            const logsJoined = log.objects.join(' ');
            return `[${log.level}] ${logsJoined}`;
        });
    }
}

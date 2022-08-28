import { Debugger } from './core/components/debug/debugger.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { Logger, LogLevel } from './logger';
import { Platform } from '@ionic/angular';
import { ApiService } from './api';
import { User } from './views';

const logger = new Logger({
    level: LogLevel.Debug,
    source: 'AppComponent'
});

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(platform: Platform, debug: Debugger, private api: ApiService) {
        if (this.showDebug) {
            platform.ready().then((result) => {
                debug.info('Platform ready:', result);

                const platformName = (() => {
                    const platforms = platform.platforms();
                    return platforms.join(', ');
                })();

                debug.info('Platform name:', platformName);
                debug.info('Environment:', environment.environmentName);
            });
        }
    }

    ngOnInit(): void {
        if (this.showDebug) {
            this.initAsync();
        }
    }

    get showDebug(): boolean {
        return environment.showDebug;
    }

    private async initAsync() {}
}

import { Debugger } from './core/components/debug/debugger.service';
import { environment } from 'src/environments/environment';
import { ApiService } from './api/ApiService.service';
import { Component, OnInit } from '@angular/core';
import { Logger, LogLevel } from './logger';
import { Platform } from '@ionic/angular';
import { State } from './state';
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
    constructor(
        private api: ApiService,
        private state: State,
        platform: Platform,
        debug: Debugger
    ) {
        platform.ready().then((result) => {
            debug.info('Platform ready:', result);

            const platformName = (() => {
                const platforms = platform.platforms();
                return platforms.join(', ');
            })();

            debug.info('Platform name:', platformName);
            debug.info('Environment:', environment.environmentName);
        });

        // TODO: remove this used for debugging only
        state.user.set(new User());
    }

    ngOnInit(): void {
        // this.initAsync();
    }

    get showDebug(): boolean {
        return environment.showDebug;
    }
}

import { ApiService } from './services/api/ApiService.service';
import { Component, OnInit } from '@angular/core';
import { Logger, LogLevel } from './logger';
import { Users } from './views';

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
    constructor(private api: ApiService) {}

    ngOnInit(): void {
        // this.initAsync();
    }

    private async initAsync() {
        const user: Users = {
            created_at: new Date().toLocaleString(),
            firstname: 'Jayson',
            middlename: 'Roberto',
            lastname_father: 'De León',
            lastname_mother: 'Martínez',
            is_deleted: false
        };

        logger.debug('trying to create a User');
        const createdUser = await this.api.users.createAsync(user);
        logger.debug('createdUser: ', createdUser);
    }
}

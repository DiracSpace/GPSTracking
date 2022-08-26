import { Component } from '@angular/core';
import { Navigation } from 'src/app/navigation';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage {
    constructor(private nav: Navigation) {}

    get username() {
        return 'Nombre de Usuario';
    }

    onLogoutClicked() {
        // TODO Terminate user session
        // TODO Clear any resources (cache, subscriptions, tokens, etc.)
        this.nav._.go();
    }

    onEditProfileClicked() {
        this.nav.mainContainer.myProfile.go();
    }
}

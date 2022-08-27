import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationItem } from './NavigationItem';

@Injectable({
    providedIn: 'root'
})
export class Navigation {
    constructor(private router: Router) {}

    _ = NavigationItem(this.router, '/');

    login = NavigationItem(this.router, '/login');

    signUp = NavigationItem(this.router, '/sign-up');

    mainContainer = {
        ...NavigationItem(this.router, '/main-container'),
        firstSteps: NavigationItem(this.router, '/main-container/first-steps'),
        home: NavigationItem(this.router, '/main-container/home'),
        profileSettings: {
            ...NavigationItem(this.router, '/main-container/profile-settings'),
            names: NavigationItem(
                this.router,
                '/main-container/profile-settings/names'
            ),
            phoneNumbers: NavigationItem(
                this.router,
                '/main-container/profile-settings/phone-numbers'
            ),
            diseases: NavigationItem(
                this.router,
                '/main-container/profile-settings/diseases'
            ),
            alergies: NavigationItem(
                this.router,
                '/main-container/profile-settings/alergies'
            ),
            addresses: NavigationItem(
                this.router,
                '/main-container/profile-settings/addresses'
            )
        }
    };
}

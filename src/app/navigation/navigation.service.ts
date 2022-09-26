import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationItem } from './NavigationItem';

@Injectable({
    providedIn: 'root'
})
export class Navigation {
    constructor(private router: Router) {}

    get mainContainerRoutes() {
        return this.mainContainer;
    }

    _ = NavigationItem(this.router, '/');

    login = NavigationItem(this.router, '/login');

    signUp = NavigationItem(this.router, '/sign-up');

    mainContainer = {
        ...NavigationItem(this.router, '/main-container'),
        firstSteps: NavigationItem(this.router, '/main-container/first-steps'),
        home: NavigationItem(this.router, '/main-container/home'),
        scanner: NavigationItem(this.router, '/main-container/scanner')
    };

    user = (uid: string) => ({
        ...NavigationItem(this.router, `/user/${uid}`),
        names: NavigationItem(this.router, `/user/${uid}/names`),
        phoneNumbers: NavigationItem(this.router, `/user/${uid}/phone-numbers`),
        addresses: NavigationItem(this.router, `/user/${uid}/addresses`),
        locations: NavigationItem(this.router, `/user/${uid}/locations`),
        diseases: NavigationItem(this.router, `/user/${uid}/diseases`),
        alergies: NavigationItem(this.router, `/user/${uid}/alergies`)
    });
}

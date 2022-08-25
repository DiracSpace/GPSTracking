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
}

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot
} from '@angular/router';
import { AuthService } from 'src/app/api/auth/auth.service';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { wait } from 'src/app/utils/time';

@Injectable({
    providedIn: 'root'
})
export class TokenGuard implements CanActivate {
    constructor(private debug: Debugger, private auth: AuthService) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        this.debug.info("Checking user's token...");
        wait(800);
        const isAuthenticated = this.auth.isAuthenticated.get();
        this.debug.info('this.auth.isAuthenticated.get(): ', isAuthenticated);
        return isAuthenticated;
    }
}

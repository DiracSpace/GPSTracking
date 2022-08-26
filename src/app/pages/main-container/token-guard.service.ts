import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { Debugger } from 'src/app/core/components/debug/debugger.service';

@Injectable({
    providedIn: 'root'
})
export class TokenGuard implements CanActivate {
    constructor(private debug: Debugger) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        this.debug.info("Checking user's token...");
        // TODO Check for user's token
        this.debug.info('User has valid token :D');
        return true;
        // return false;
    }
}

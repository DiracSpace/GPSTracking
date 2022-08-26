import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Navigation } from 'src/app/navigation';

@Injectable({
    providedIn: 'root'
})
export class ProfileCompletionGuard implements CanActivate {
    constructor(private debug: Debugger, private nav: Navigation) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        this.debug.info(
            'Checking is user has completed his/her first steps...'
        );
        // TODO Check user profile
        const hasCompletedProfile = true;

        if (!hasCompletedProfile) {
            this.debug.info(
                'The user has not completed his/her first steps :0'
            );
            this.nav.mainContainer.firstSteps.go();
            return false;
        }

        this.debug.info('The user has completed his/her first steps :D');
        return true;
    }
}

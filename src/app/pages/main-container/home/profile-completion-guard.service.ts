import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/api';
import { AuthService } from 'src/app/api/auth/auth.service';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Navigation } from 'src/app/navigation';

@Injectable({
    providedIn: 'root'
})
export class ProfileCompletionGuard implements CanActivate {
    constructor(
        private debug: Debugger,
        private nav: Navigation,
        private api: ApiService
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        this.debug.info('Checking is user has completed his/her first steps...');
        const { uid } = await this.api.auth.currentUser;
        const profileHasMissingValues =
            await this.api.users.userProfileHasMissingValuesAsync(uid);

        this.debug.info('profileHasMissingValues', profileHasMissingValues);
        if (profileHasMissingValues) {
            this.debug.info('User is authenticated, but missing profile information');
            this.nav.mainContainer.profileSettings.go();
            return false;
        }

        this.debug.info('The user has completed his/her first steps :D');
        return true;
    }
}

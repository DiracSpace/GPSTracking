import { Injectable, Injector } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RouteGuardSyncService implements CanActivate {
    constructor(public injector: Injector) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> {
        return from(route.data.routeGuards).pipe(
            concatMap((value) => {
                const guard = this.injector.get(value);
                const result = guard.canActivate(route, state);
                if (result instanceof Observable) {
                    return result;
                } else if (result instanceof Promise) {
                    return from(result);
                } else {
                    return of(result);
                }
            }),
            first((x) => x === false || x instanceof UrlTree, true)
        );
    }
}

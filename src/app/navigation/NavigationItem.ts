import { NavigationExtras, Router } from '@angular/router';

export const NavigationItem = (router: Router, path: string) => {
    return {
        path,
        go: (options?: { extras?: NavigationExtras }): Promise<boolean> => {
            return router.navigate([path], options?.extras);
        }
    };
};

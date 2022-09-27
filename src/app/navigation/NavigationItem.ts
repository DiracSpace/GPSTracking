import { NavigationExtras, Router } from '@angular/router';

export const NavigationItem = (router: Router, path: string) => ({
    path,
    go: (options?: { extras?: NavigationExtras }): Promise<boolean> =>
        router.navigate([path], options?.extras)
});

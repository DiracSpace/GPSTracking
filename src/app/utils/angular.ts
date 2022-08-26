import { Subscription } from 'rxjs';

export function disposeSubscription(subs: Subscription) {
    if (!subs) {
        return;
    }

    subs.unsubscribe();
    subs = null;
}

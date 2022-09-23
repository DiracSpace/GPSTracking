import { Injectable } from '@angular/core';
import { AlertsService } from './alerts.service';
import { LoadersService } from './loaders.service';
import { ToastsService } from './toasts.service';

@Injectable({ providedIn: 'root' })
export class Popups {
    constructor(
        public alerts: AlertsService,
        public loaders: LoadersService,
        public toasts: ToastsService
    ) {}
}

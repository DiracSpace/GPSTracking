import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ErrorDetails } from '../utils/errors';

@Injectable({ providedIn: 'root' })
export class AlertUtils {
    constructor(private alerts: AlertController) {}

    async error(message: string, error: ErrorDetails): Promise<HTMLIonAlertElement> {
        const alert = await this.alerts.create({
            message: `${message}. ${error.toString()}.`
        });
        await alert.present();
        return alert;
    }
}

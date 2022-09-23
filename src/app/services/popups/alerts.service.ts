import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ErrorDetails } from '../../utils/errors';

@Injectable({ providedIn: 'root' })
export class AlertsService {
    constructor(private alerts: AlertController) {}

    async showAsync(message: string): Promise<HTMLIonAlertElement> {
        const alert = await this.alerts.create({ message });
        await alert.present();
        return alert;
    }

    async error(message: string, error?: ErrorDetails): Promise<HTMLIonAlertElement> {
        const finalMessage =
            error != undefined && error != null
                ? `${message}. ${error.toString()}.`
                : message;

        const alert = await this.alerts.create({
            message: finalMessage
        });

        await alert.present();

        return alert;
    }
}

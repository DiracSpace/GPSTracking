import { Injectable } from '@angular/core';
import { AlertButton, AlertController, ToastController } from '@ionic/angular';
import { Debugger } from '../core/components/debug/debugger.service';
import { Logger, LogLevel } from '../logger';

export type ToastsColorCodes = 'danger' | 'success' | 'warning';
export type AlertDefaultConfirmations = 'yes' | 'no';

const logger = new Logger({
    source: 'ToastsService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class ToastsService {
    private alertHandlerMessage: string = '';
    private alertRoleMessage: string = '';
    private DefaultConfirmationButtons: AlertButton[] = [
        {
            text: 'Cancelar',
            role: 'no',
            handler: () => {
                this.alertHandlerMessage = 'Cancelado';
            }
        },
        {
            text: 'OK',
            role: 'yes',
            handler: () => {
                this.alertHandlerMessage = 'Confirmado';
            }
        }
    ];

    constructor(
        private toastsController: ToastController,
        private alertController: AlertController, // TODO: for now, leave here
        private debug: Debugger
    ) {}

    async presentToastAsync(
        message: string,
        colorCode: ToastsColorCodes = 'success',
        duration: number = 800
    ) {
        if (!message) {
            throw 'No message was provided for toast!';
        }

        const toast = await this.toastsController.create({
            message: message,
            duration: duration,
            color: colorCode
        });
        await toast.present();
    }

    /**
     * Creates a simple alert message that
     * returns true if user accepts confirmation.
     *
     * @param header Title of alert message
     * @param subHeader Subtitle of alert message
     * @param message Message to notify user
     * @param roleToCheck String used to check if confirmation is true or false, it's defined as role in buttons
     * @param buttons The alert buttons the user can use to interact with the alert
     * @returns True if roleToCheck is selected, false if other option is selected
     */
    async presentAlertAsync(
        header: string = 'Alert',
        subHeader: string = 'Important Message',
        message: string,
        roleToCheck: AlertDefaultConfirmations | string,
        buttons: (string | AlertButton)[] = this.DefaultConfirmationButtons
    ): Promise<boolean> {
        if (!message) {
            throw 'No message was provided for alert!';
        }

        if (!roleToCheck) {
            throw 'No truthy check was provided for alert!';
        }

        const alert = await this.alertController.create({
            header: header,
            subHeader: subHeader,
            message: message,
            buttons: buttons
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        logger.log('role:', role);

        return role == roleToCheck || role.includes(roleToCheck);
    }
}

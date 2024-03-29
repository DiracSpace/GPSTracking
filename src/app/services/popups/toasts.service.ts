import { Injectable } from '@angular/core';
import { AlertButton, AlertController, ToastController } from '@ionic/angular';
import { Debugger } from '../../core/components/debug/debugger.service';

export type ToastsColorCodes = 'danger' | 'success' | 'warning';

export type AlertDefaultConfirmations = 'yes' | 'no';

@Injectable({ providedIn: 'root' })
export class ToastsService {
    private alertHandlerMessage = '';
    private alertRoleMessage = '';
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
            message,
            duration,
            color: colorCode
        });
        await toast.present();
    }

    async success(
        message: string,
        options?: { duration?: number }
    ): Promise<HTMLIonToastElement> {
        const toast = await this.toastsController.create({
            color: 'success',
            message,
            duration: options?.duration ?? 1500
        });

        await toast.present();
        return toast;
    }

    async error(
        message: string,
        options?: { duration?: number }
    ): Promise<HTMLIonToastElement> {
        const toast = await this.toastsController.create({
            color: 'danger',
            message,
            duration: options?.duration ?? 3000
        });
        await toast.present();
        return toast;
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
            header,
            subHeader,
            message,
            buttons
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        this.debug.info('role:', role);

        return role == roleToCheck || role.includes(roleToCheck);
    }
}

import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Debugger } from '../core/components/debug/debugger.service';
import { Logger, LogLevel } from '../logger';

export type ToastsColorCodes = 'danger' | 'success' | 'warning';

const logger = new Logger({
    source: 'ToastsService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class ToastsService {
    constructor(private toastsController: ToastController, private debug: Debugger) {}

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
}

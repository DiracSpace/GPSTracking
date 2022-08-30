import { ErrorHandler, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Debugger } from '../core/components/debug/debugger.service';
import { decodeErrorDetails, ErrorDetails, ERROR_CODE_UNKNOWN } from '../utils/errors';

const IGNORED_ERRORS: string[] = ['ExpressionChangedAfterItHasBeenCheckedError'];

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
    constructor(private toasts: ToastController, private debug: Debugger) {}

    handleError(error: any): void {
        const details = decodeErrorDetails(error);

        if (environment.showDebug && !this.isErrorIgnored(details)) {
            this.debug.error(details.toString());
        }

        if (details.name == ERROR_CODE_UNKNOWN) {
            this.showErrorToastAsync(details.toString());
        }

        // throw error;
    }

    private isErrorIgnored(details: ErrorDetails): boolean {
        if (IGNORED_ERRORS.includes(details.name)) {
            return true;
        }

        if (IGNORED_ERRORS.some((code) => details.name && details.name.includes(code))) {
            return true;
        }

        if (
            IGNORED_ERRORS.some(
                (code) => details.message && details.message.includes(code)
            )
        ) {
            return true;
        }

        return false;
    }

    private async showErrorToastAsync(message: string): Promise<void> {
        const toast = await this.toasts.create({
            color: 'danger',
            duration: 5000,
            message,
            position: 'middle'
        });

        toast.present();
    }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { ValidationService } from 'src/app/services/validation.service';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { User } from 'src/app/views';
import { environment } from 'src/environments/environment';

const logger = new Logger({
    source: 'SignUpPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.page.html',
    styleUrls: ['./sign-up.page.scss']
})
export class SignUpPage implements OnInit {
    showForm: 'email' | 'password' = 'email';

    emailForm = this.forms.group({
        email: new FormControl('', [
            Validators.required,
            ValidationService.emailValidator
        ])
    });

    emailValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'El correo electrónico es obligatorio'
        }
    ];

    passwordForm = this.forms.group(
        {
            password: new FormControl('', [Validators.required]),
            passwordConfirm: new FormControl('', [Validators.required])
        },
        {
            validators: [ValidationService.passwordCompareValidator]
        }
    );

    passwordValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'Ingresa una contraseña'
        }
    ];

    passwordConfirmValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'Confirma tu contraseña'
        }
    ];

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private forms: FormBuilder,
        private debug: Debugger,
        private nav: Navigation,
        private api: ApiService
    ) {}

    ngOnInit() {}

    onSignUpClicked() {
        this.nav.login.go({
            extras: {
                replaceUrl: true
            }
        });
    }

    async onEmailFormSubmit() {
        if (!this.emailForm.valid) {
            return;
        }
        this.showForm = 'password';
    }

    async onPasswordFormSubmit() {
        if (!this.passwordForm.valid) {
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Creando tu cuenta'
        });

        await loadingDialog.present();

        const email = this.emailForm.get('email').value;
        const password = this.passwordForm.get('password').value;
        let fireAuthUser = null;

        try {
            fireAuthUser = await this.api.auth.createUserWithEmailAndPasswordAsync(
                email,
                password
            );
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            loadingDialog.dismiss();
            this.toasts.error(errorDetails.message);
            return;
        }

        const user = new User();
        user.uid = fireAuthUser.uid;
        user.email = fireAuthUser.email;
        user.emailVerified = fireAuthUser.emailVerified;
        user.photoUrl = fireAuthUser.photoURL;
        user.qrCodeUrl = `${environment.domains.default}/user/${fireAuthUser.uid}`;

        await this.api.users.createAsync(user);
        loadingDialog.dismiss();
        this.nav.mainContainer.home.go();
    }

    onBackClicked() {
        this.passwordForm.reset();
        this.showForm = 'email';
    }

    // private resetForm() {
    //     this.showForm = 'email';
    //     this.emailForm.reset();
    //     this.passwordForm.reset();
    // }
}

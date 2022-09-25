import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { ValidationService } from 'src/app/services/validation.service';

const logger = new Logger({
    source: 'LoginPage',
    level: LogLevel.Off
});

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
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

    passwordForm = this.forms.group({
        password: new FormControl('', [
            Validators.required,
            ValidationService.passwordValidator
        ])
    });

    passwordValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'La contraseña es obligatoria'
        }
    ];

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private forms: FormBuilder,
        private nav: Navigation,
        private api: ApiService
    ) {}

    ngOnInit() {}

    get username() {
        return this.emailForm.get('email')?.value ?? 'Usuario';
    }

    onSignUpClicked() {
        this.nav.signUp.go({
            extras: {
                replaceUrl: true
            }
        });
    }

    async onEmailFormSubmit() {
        logger.log('this.emailForm.valid:', this.emailForm.valid);
        if (!this.emailForm.valid) {
            logger.log('emailForm not valid!');
            this.resetForm();
            return;
        }
        this.showForm = 'password';
    }

    async onPasswordFormSubmit() {
        logger.log('this.passwordForm.valid:', this.passwordForm.valid);
        if (!this.passwordForm.valid) {
            logger.log('passwordForm not valid!');
            this.resetForm();
            return;
        }

        const email = this.emailForm.get('email').value;
        const password = this.passwordForm.get('password').value;

        const loadingDialog = await this.loadingController.create({
            message: 'Iniciando sesión'
        });
        await loadingDialog.present();

        try {
            logger.log('signing up!');
            await this.api.auth.signInWithEmailAndPassword(email, password);
            logger.log('signed up!');
        } catch (error) {
            logger.log('error:', error);
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        logger.log('navigating to home');
        this.resetForm();
        await this.nav.mainContainer.home.go();
    }

    onBackClicked() {
        this.showForm = 'email';
        this.resetForm();
    }

    private resetForm() {
        this.showForm = 'email';
        this.emailForm.reset();
        this.passwordForm.reset();
    }
}

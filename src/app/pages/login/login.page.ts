import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Navigation } from 'src/app/navigation';
import { ToastsService } from 'src/app/services/toasts.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
    showForm: 'email' | 'password' = 'email';

    emailForm = this.forms.group({
        email: new FormControl('', [Validators.required])
    });

    emailValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'El correo electrónico es obligatorio'
        }
    ];

    passwordForm = this.forms.group({
        password: new FormControl('', [Validators.required])
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
        if (!this.emailForm.valid) {
            return;
        }
        this.showForm = 'password';
    }

    async onPasswordFormSubmit() {
        if (!this.passwordForm.valid) {
            return;
        }

        const email = this.emailForm.get('email').value;
        const password = this.passwordForm.get('password').value;

        const loadingDialog = await this.loadingController.create({
            message: 'Iniciando sesión'
        });
        await loadingDialog.present();

        try {
            await this.api.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, "danger");
            this.resetForm();
            return;
        }

        await loadingDialog.dismiss();
        this.resetForm();
        this.nav.mainContainer.home.go();
    }

    onBackClicked() {
        this.showForm = 'email';
    }

    private resetForm() {
        this.showForm = 'email';
        this.emailForm.reset();
        this.passwordForm.reset();
    }
}

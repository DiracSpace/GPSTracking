import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Navigation } from 'src/app/navigation';
import { EntityConverter, User, UserEmail } from 'src/app/views';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.page.html',
    styleUrls: ['./sign-up.page.scss']
})
export class SignUpPage implements OnInit {
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
        password: new FormControl('', [Validators.required]),
        passwordConfirm: new FormControl('', [Validators.required])
    });

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
        private toasts: ToastController,
        private forms: FormBuilder,
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
            message: 'Iniciando sesión'
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
        } catch (err) {
            await loadingDialog.dismiss();
            const toast = await this.toasts.create({
                message: err,
                duration: 800
            });
            await toast.present();
            this.resetForm();
            return;
        }

        const user = new User();

        user.uid = fireAuthUser.uid;
        user.email = fireAuthUser.email;
        user.emailVerified = fireAuthUser.emailVerified;
        user.photoUrl = fireAuthUser.photoURL;
        user.qrCodeUrl = `${environment.domains.default}/${fireAuthUser.uid}`;

        this.resetForm();
        await this.api.users.createAsync(user);
        await loadingDialog.dismiss();
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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/api';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Navigation } from 'src/app/navigation';
import { EntityConverter, User, UserEmail } from 'src/app/views';

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

    constructor(private forms: FormBuilder, private nav: Navigation, private api: ApiService) {}

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

        const userExists = false; // TODO Query user

        if (userExists) {
            // TODO Show error message
            return;
        }

        this.showForm = 'password';
    }

    async onPasswordFormSubmit() {
        if (!this.passwordForm.valid) {
            return;
        }

        const credentialsAreValid = true; // TODO Query credentials

        if (!credentialsAreValid) {
            // TODO Show error message
            return;
        }

        const email = this.emailForm.get('email').value;
        const password = this.passwordForm.get('password').value;
        const fireAuthUser = await this.api.auth.createUserWithEmailAndPasswordAsync(email, password);
        const user = new User();

        user.uid = fireAuthUser.uid;
        user.email = fireAuthUser.email;
        user.emailVerified = fireAuthUser.emailVerified;
        user.photoUrl = fireAuthUser.photoURL;

        await this.api.users.createAsync(user);

        this.nav.mainContainer.home.go();
    }

    onBackClicked() {
        this.showForm = 'email';
    }
}

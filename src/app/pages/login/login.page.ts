import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Navigation } from 'src/app/navigation';

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

    constructor(private forms: FormBuilder, private nav: Navigation) {}

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

        const userExists = true; // TODO Query user

        if (!userExists) {
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

        this.nav.mainContainer.home.go();
    }

    onBackClicked() {
        this.showForm = 'email';
    }
}

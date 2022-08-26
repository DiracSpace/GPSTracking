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
    showForm: 'username' | 'password' = 'username';

    usernameForm = this.forms.group({
        username: new FormControl('', [Validators.required])
    });

    usernameValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'Username is required'
        }
    ];

    passwordForm = this.forms.group({
        password: new FormControl('', [Validators.required])
    });

    passwordValidationMessages: ValidationErrorMessage[] = [
        {
            type: 'required',
            message: 'Password is required'
        }
    ];

    constructor(private forms: FormBuilder, private nav: Navigation) {}

    ngOnInit() {}

    get username() {
        return 'nombre_de_usuario'; // TODO Get username
    }

    onSignUpClicked() {
        this.nav.signUp.go({
            extras: {
                replaceUrl: true
            }
        });
    }

    async onUsernameFormSubmit() {
        if (!this.usernameForm.valid) {
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
        this.showForm = 'username';
    }
}

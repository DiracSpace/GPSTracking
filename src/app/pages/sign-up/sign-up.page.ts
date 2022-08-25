import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ValidationErrorMessage } from 'src/app/core/components/form-control-error';
import { Navigation } from 'src/app/core/navigation';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.page.html',
    styleUrls: ['./sign-up.page.scss']
})
export class SignUpPage implements OnInit {
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

    onSignUpClicked() {
        this.nav.login.go({
            extras: {
                replaceUrl: true
            }
        });
    }

    async onUsernameFormSubmit() {
        if (!this.usernameForm.valid) {
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

        // TODO Navigate to home page
    }

    onBackClicked() {
        this.showForm = 'username';
    }
}

import { Logger, LogLevel } from '../logger';
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

const logger = new Logger({
    source: 'ValidationService',
    level: LogLevel.Off
});

@Injectable({ providedIn: 'root' })
export class ValidationService {
    private static readonly validationMessages = new Map<string, string>([
        ['required', 'La propiedad es obligatoria'],
        ['invalidNumberField', 'Solo se permiten números'],
        ['invalidDateField', 'No es una fecha válida'],
        ['invalidCreditCard', 'El dato ingresado no tiene formato de tarjeta válida'],
        [
            'invalidEmailAddress',
            'El dato ingresado no tiene formato de correo electrónico'
        ],
        [
            'invalidPassword',
            'La contraseña es inválida. Debe tener al menos 6 carácteres y un número'
        ],
        ['invalidPasswordMatch', 'Las contraseñas deben ser iguales']
    ]);

    constructor() {}

    static getValidationMessage(validatorName: string, validatorValue?: any) {
        logger.log('validatorName:', validatorName);
        logger.log('validatorValue:', validatorValue);
        return this.validationMessages.get(validatorName);
    }

    /**
     * Validates phone number meets section requirements
     *
     * @param control AbstractControl
     * @returns ValidationError | null
     */
    static phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
        if (!control || !control.value) {
            logger.log('formControl for phone number is null!');
            return null;
        }

        if (control.value.match(/^([0-9]|[0-9][0-9]|[1-9][0-9][0-9])$/)) {
            logger.log('phone number passed!');
            return null;
        }

        return { invalidNumberField: true };
    }

    /**
     * Validates email meets RFC 2822 compliance
     * @param control AbstractControl
     * @returns ValidationError | null
     */
    static emailValidator(control: AbstractControl): ValidationErrors | null {
        if (!control || !control.value) {
            logger.log('formControl for email is null!');
            return null;
        }

        if (
            control.value.match(
                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            )
        ) {
            logger.log('email passed!');
            return null;
        }

        return { invalidEmailAddress: true };
    }

    /**
     * Validates password with the following configurations:
     * - {6, 100} Asserts password is between 6 and 100 characters
     * - (?=.*[0-9]) Asserts a string has at least one number
     *
     * @param control AbstractControl
     * @returns ValidationError | null
     */
    static passwordValidator(control: AbstractControl): ValidationErrors | null {
        if (!control || !control.value) {
            logger.log('formControl for password is null!');
            return null;
        }

        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            logger.log('password passed!');
            return null;
        }

        return { invalidPassword: true };
    }

    /**
     * Asserts that password and confirm
     * password are an exact match
     *
     * @param formGroup FormGroup
     * @returns ValidationError | null
     */
    static passwordCompareValidator(formGroup: FormGroup): ValidationErrors | null {
        if (!formGroup || !formGroup.value) {
            logger.log('no values in password compare!');
            return null;
        }

        let { password, passwordConfirm } = formGroup.value;

        if (!password || !passwordConfirm) {
            logger.log('no password values!');
            return null;
        }

        if (password === passwordConfirm) {
            logger.log('passwords match!');
            return null;
        } else {
            logger.log("password don't match!");
            return { invalidPasswordMatch: true };
        }
    }
}

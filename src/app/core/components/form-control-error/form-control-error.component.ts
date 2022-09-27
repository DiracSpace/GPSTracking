import { ValidationErrorMessage } from './ValidationErrorMessage';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { Logger, LogLevel } from 'src/app/logger';

const logger = new Logger({
    source: 'FormControlErrorComponent',
    level: LogLevel.Off
});

@Component({
    selector: 'app-form-control-error',
    templateUrl: './form-control-error.component.html',
    styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent implements OnInit {
    @Input() messages: ValidationErrorMessage[] = [];
    @Input() formControlNamex: string;
    @Input() formGroup: FormGroup;

    constructor() {}

    ngOnInit() {}

    get formControl(): AbstractControl<any, any> | null {
        return this.formGroup.get(this.formControlNamex);
    }

    get hasValidationErrorMessage(): boolean {
        return (
            this.formControlValidationErrorMessage != null ||
            this.formGroupValidationErrorMessage != null
        );
    }

    get formControlValidationErrorMessage(): string | null {
        logger.log('this.formGroup:', this.formGroup);
        if (!this.formControl) {
            logger.log('no formControl!');
            return null;
        }

        const { errors } = this.formControl;
        logger.log('errors:', errors);
        if (!errors) {
            logger.log('no errors in formControl!');
            return null;
        }

        for (const propertyName in errors) {
            if (
                this.formControl.errors.hasOwnProperty(propertyName) &&
                this.formControl.touched
            ) {
                logger.log('propertyName:', propertyName);
                logger.log(
                    'this.formControl.errors[propertyName]:',
                    this.formControl.errors[propertyName]
                );
                return ValidationService.getValidationMessage(
                    propertyName,
                    this.formControl.errors[propertyName]
                );
            }
        }
    }

    get formGroupValidationErrorMessage(): string | null {
        logger.log('this.formGroup:', this.formGroup);
        if (!this.formGroup) {
            logger.log('no formGroup!');
            return null;
        }

        const { errors } = this.formGroup;
        logger.log('errors:', errors);
        if (!errors) {
            logger.log('no errors in formGroup!');
            return null;
        }

        for (const propertyName in errors) {
            if (
                this.formGroup.errors.hasOwnProperty(propertyName) &&
                this.formGroup.touched
            ) {
                logger.log('propertyName:', propertyName);
                logger.log(
                    'this.formGroup.errors[propertyName]:',
                    this.formGroup.errors[propertyName]
                );
                return ValidationService.getValidationMessage(
                    propertyName,
                    this.formGroup.errors[propertyName]
                );
            }
        }
    }
}

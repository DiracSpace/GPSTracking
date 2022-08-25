import { Component, Input, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup } from '@angular/forms';
import { ValidationErrorMessage } from './ValidationErrorMessage';

@Component({
    selector: 'app-form-control-error',
    templateUrl: './form-control-error.component.html',
    styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent implements OnInit {
    @Input() formGroup: FormGroup;
    @Input() formControlNamex: string;
    @Input() messages: ValidationErrorMessage[] = [];

    constructor() {}

    ngOnInit() {}

    get formControl() {
        return this.formGroup.get(this.formControlNamex);
    }
}

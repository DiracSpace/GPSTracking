import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';

@Component({
    selector: 'app-alergies-settings',
    templateUrl: './alergies-settings.page.html',
    styleUrls: ['./alergies-settings.page.scss']
})
export class AlergiesSettingsPage implements OnInit {
    formGroup = this.forms.group({
        alergies: this.forms.array<FormGroup>([])
    });

    constructor(private forms: FormBuilder) {}

    ngOnInit() {}

    onAddClicked() {
        const formArray = this.formGroup.get('alergies') as FormArray;
        formArray.push(
            this.forms.group({
                alergy: new FormControl('', [Validators.required])
            })
        );
    }
}

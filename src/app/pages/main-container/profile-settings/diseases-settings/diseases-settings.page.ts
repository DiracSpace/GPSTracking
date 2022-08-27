import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';

@Component({
    selector: 'app-diseases-settings',
    templateUrl: './diseases-settings.page.html',
    styleUrls: ['./diseases-settings.page.scss']
})
export class DiseasesSettingsPage implements OnInit {
    formGroup = this.forms.group({
        diseases: this.forms.array<FormGroup>([])
    });

    constructor(private forms: FormBuilder) {}

    ngOnInit() {}

    onAddDiseaseClicked() {
        const formArray = this.formGroup.get('diseases') as FormArray;
        formArray.push(
            this.forms.group({
                disease: new FormControl('', [Validators.required])
            })
        );
    }
}

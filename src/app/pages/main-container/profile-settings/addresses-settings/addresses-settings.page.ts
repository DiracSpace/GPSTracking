import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-addresses-settings',
    templateUrl: './addresses-settings.page.html',
    styleUrls: ['./addresses-settings.page.scss']
})
export class AddressesSettingsPage implements OnInit {
    formGroup = this.forms.group({
        addresses: this.forms.array<FormGroup>([])
    });

    constructor(private forms: FormBuilder) {}

    ngOnInit() {}

    onAddClicked() {
        const formArray = this.formGroup.get('addresses') as FormArray;

        formArray.push(
            this.forms.group({
                state: new FormControl(''), 
                county: new FormControl(''), 
                neighbourhood: new FormControl(''), 
                street: new FormControl(''),
                numberExternal: new FormControl(''),
                numberInternal: new FormControl(''),
                betweenStreet1: new FormControl(''),
                betweenStreet2: new FormControl(''),
                zipCode: new FormControl(0), 
                addressType: new FormControl(''),
                additionalInstructions: new FormControl('')
            })
        );
    }
}

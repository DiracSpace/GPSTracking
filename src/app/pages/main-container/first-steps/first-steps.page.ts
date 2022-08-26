import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';

type FormType =
    | 'nameForm'
    | 'phoneNumbersForm'
    | 'diseasesForm'
    | 'alergiesForm'
    | 'addressesForm';

@Component({
    selector: 'app-first-steps',
    templateUrl: './first-steps.page.html',
    styleUrls: ['./first-steps.page.scss']
})
export class FirstStepsPage implements OnInit {
    nameForm = this.forms.group({
        firstName: new FormControl('', [Validators.required]),
        middleName: new FormControl(''),
        lastNameFather: new FormControl('', [Validators.required]),
        lastNameMother: new FormControl('', [Validators.required])
    });
    phoneNumbersForm = this.forms.array<FormGroup>([]);
    diseasesForm = this.forms.array<FormGroup>([]);
    alergiesForm = this.forms.array<FormGroup>([]);
    addressesForm = this.forms.array<FormGroup>([]);

    showForm: FormType = 'nameForm';

    formTitles = new Map<FormType, string>([
        ['nameForm', 'Nombre Completo'],
        ['phoneNumbersForm', 'Números de Teléfono'],
        ['diseasesForm', 'Enfermedades'],
        ['alergiesForm', 'Alergias'],
        ['addressesForm', 'Direcciones']
    ]);

    constructor(private forms: FormBuilder) {}

    ngOnInit() {}

    onAddPhoneNumberClicked() {
        this.phoneNumbersForm.push(
            this.forms.group({
                // The phone number
                number: new FormControl('', [Validators.required]),

                // The owner of this phone number
                // Available options are "Mine", "Mom's", "Dad's", Other (specify)
                who: new FormControl('', [Validators.required]),

                // Only available if the "who" option is not "Mine"
                alias: new FormControl('')
            })
        );
    }

    onAddDiseaseClicked() {
        this.diseasesForm.push(
            this.forms.group({
                disease: new FormControl('', [Validators.required])
            })
        );
    }

    onAddAlergiesClicked() {
        this.alergiesForm.push(
            this.forms.group({
                alergy: new FormControl('', [Validators.required])
            })
        );
    }

    onAddAddressClicked() {
        this.addressesForm.push(
            this.forms.group({
                state: new FormControl(''), // Estado
                county: new FormControl(''), // Ciudad/Municipio
                neighbourhood: new FormControl(''), // Colonia
                street: new FormControl(''),
                numberExternal: new FormControl(''),
                numberInternal: new FormControl(''),
                betweenStreet1: new FormControl(''),
                betweenStreet2: new FormControl(''),
                zipCode: new FormControl(0), // Codigo Postal
                addressType: new FormControl(''),
                additionalInstructions: new FormControl('')
            })
        );
    }
}

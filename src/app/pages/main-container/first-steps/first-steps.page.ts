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
}

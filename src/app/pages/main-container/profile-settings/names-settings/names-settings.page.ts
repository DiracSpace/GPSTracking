import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
    selector: 'app-names-settings',
    templateUrl: './names-settings.page.html',
    styleUrls: ['./names-settings.page.scss']
})
export class NamesSettingsPage implements OnInit {
    formGroup = this.forms.group({
        names: new FormControl(''),
        lastNameFather: new FormControl(''),
        lastNameMother: new FormControl('')
    });

    constructor(private forms: FormBuilder) {}

    ngOnInit() {}
}

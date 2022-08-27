import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-phone-numbers-settings',
  templateUrl: './phone-numbers-settings.page.html',
  styleUrls: ['./phone-numbers-settings.page.scss']
})
export class PhoneNumbersSettingsPage implements OnInit {
  formGroup = this.forms.group({
    phoneNumbers: this.forms.array<FormGroup>([])
  });

  constructor(private forms: FormBuilder) {}

  ngOnInit() {}

  get formArray() {
    return this.formGroup.controls.phoneNumbers;
  }

  onAddClicked() {
    const formArray = this.formGroup.get('phoneNumbers') as FormArray;
    formArray.push(
      this.forms.group({
        // The phone number
        number: new FormControl(''),

        // The owner of this phone number
        // Available options are "Mine", "Mom's", "Dad's", Other (specify)
        who: new FormControl(''),

        // Only available if the "who" option is not "Mine"
        alias: new FormControl('')
      })
    );
  }

  onDeleteClick(index: number) {
    this.formArray.removeAt(index);
  }

  onFormArraySubmit() {
    console.log('submit');
  }

  getPhoneNumberOrDefault(index: number): string {
    const control = this.formArray.controls[index];
    console.log('control', control);
    const value = this.formArray.controls[index].get('phoneNumber');
    console.log('value', value);
    return value as any;
    // return value;
    // return phoneNumberForm.value;
  }
}

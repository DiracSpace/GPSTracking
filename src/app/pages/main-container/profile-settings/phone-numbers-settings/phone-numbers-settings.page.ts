import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { PhoneNumber, User } from 'src/app/api/users';
import { PhoneNumberOwnerTypes } from 'src/app/api/users/User';
import {
  ArgumentNullError,
  NotImplementedError,
  RequiredPropError
} from 'src/app/errors';
import { State } from 'src/app/state';
import { wait } from 'src/app/utils/time';

@Component({
  selector: 'app-phone-numbers-settings',
  templateUrl: './phone-numbers-settings.page.html',
  styleUrls: ['./phone-numbers-settings.page.scss']
})
export class PhoneNumbersSettingsPage implements OnInit {
  user = new User();
  ownerTypes = PhoneNumberOwnerTypes;

  constructor(
    private api: ApiService,
    private state: State,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  get phoneNumbers(): PhoneNumber[] {
    if (this.user.phoneNumbers == undefined || this.user.phoneNumbers == null) {
      return [];
    }

    return this.user.phoneNumbers;
  }

  async onAddClicked() {
    const loadingDialog = await this.loadingController.create({
      message: 'Añadiendo...'
    });

    await loadingDialog.present();

    await wait(500); // TODO Remove this

    const phoneNumber = new PhoneNumber();
    this.phoneNumbers.push(phoneNumber);
    // TODO Add to firestore
    // TODO Add to app state

    await loadingDialog.dismiss();
  }

  async onDeleteClick(phoneNumber: PhoneNumber) {
    const caller = 'onDeleteClick';
    RequiredPropError.throwIfNull(this.phoneNumbers, 'phoneNumbers', caller);

    const index = this.phoneNumbers.indexOf(phoneNumber);

    if (index == -1) {
      throw new NotImplementedError('Could not find phone number to delete', caller);
    }

    const loadingDialog = await this.loadingController.create({
      message: 'Eliminando...'
    });

    await loadingDialog.present();

    await wait(500); // TODO Remove this
    // TODO Delete from firestore
    // TODO Delete from app state
    this.phoneNumbers.splice(index, 1);

    await loadingDialog.dismiss();
  }

  async onSaveClicked(phoneNumber: PhoneNumber) {
    const loadingDialog = await this.loadingController.create({
      message: 'Guardando...'
    });

    await loadingDialog.present();

    await wait(500); // TODO Remove this
    // TOOD Update in firestore
    // TODO Update in app state

    await loadingDialog.dismiss();
  }

  getPhoneNumberDescription(phoneNumber: PhoneNumber): string {
    const caller = 'getPhoneNumberOrDefault';
    ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);

    if (!phoneNumber.number) {
      return 'Desconocido';
    }

    const parts: string[] = [phoneNumber.number];

    if (phoneNumber.owner) {
      parts.push(phoneNumber.owner);
    }

    return parts.join(' | ');
  }

  isPhoneNumberOwnerNotMine(phoneNumber: PhoneNumber): boolean {
    const caller = 'isPhoneNumberOwnerNotMine';
    ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);
    return phoneNumber.owner != 'Mío';
  }

  isPhoneNumberOwnerOther(phoneNumber: PhoneNumber): boolean {
    const caller = 'isPhoneNumberOwnerOther';
    ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);
    return phoneNumber.owner == 'Otro';
  }
}

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
  selector: 'app-alergies-settings',
  templateUrl: './alergies-settings.page.html',
  styleUrls: ['./alergies-settings.page.scss']
})
export class AlergiesSettingsPage implements OnInit {
  user = new User();
  alergyInput = '';

  constructor(
    private api: ApiService,
    private state: State,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  get alergies(): string[] {
    if (this.user.alergies == undefined || this.user.alergies == null) {
      return [];
    }

    return this.user.alergies;
  }

  onAlergyEnter() {
    if (!this.alergyInput) {
      return;
    }

    this.alergies.push(this.alergyInput);
    this.alergyInput = '';
  }

  onDeleteClicked(alergy: string) {
    const index = this.alergies.indexOf(alergy);
    this.alergies.splice(index, 1);
  }
}

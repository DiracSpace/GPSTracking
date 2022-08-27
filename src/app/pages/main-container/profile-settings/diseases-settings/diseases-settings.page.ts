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
  selector: 'app-diseases-settings',
  templateUrl: './diseases-settings.page.html',
  styleUrls: ['./diseases-settings.page.scss']
})
export class DiseasesSettingsPage implements OnInit {
  user = new User();
  diseaseInput = '';

  constructor(
    private api: ApiService,
    private state: State,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  get diseases(): string[] {
    if (this.user.diseases == undefined || this.user.diseases == null) {
      return [];
    }

    return this.user.diseases;
  }

  onDiseaseEnter() {
    if (!this.diseaseInput) {
      return;
    }

    this.diseases.push(this.diseaseInput);
    this.diseaseInput = '';
  }

  onDeleteClicked(disease: string) {
    const index = this.diseases.indexOf(disease);
    this.diseases.splice(index, 1);
  }
}

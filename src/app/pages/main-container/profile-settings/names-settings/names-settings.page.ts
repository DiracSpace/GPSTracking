import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api/api.service';
import { User } from 'src/app/api/users';
import { State } from 'src/app/state';

@Component({
  selector: 'app-names-settings',
  templateUrl: './names-settings.page.html',
  styleUrls: ['./names-settings.page.scss']
})
export class NamesSettingsPage implements OnInit {
  user = new User();

  constructor(
    private api: ApiService,
    private state: State,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.user = this.state.user.get();
  }

  async onSaveClicked() {
    console.log('user', this.user);

    const loadingDialog = await this.loadingController.create({
      message: 'Guardando...'
    });

    await loadingDialog.present();

    // TODO Update user in firestore
    // TODO Update user in app state

    await loadingDialog.dismiss();

    // TODO Go back?
  }
}

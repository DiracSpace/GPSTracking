import { User, UserAlergyDetail } from 'src/app/views';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { State } from 'src/app/state';

@Component({
    selector: 'app-alergies-settings',
    templateUrl: './alergies-settings.page.html',
    styleUrls: ['./alergies-settings.page.scss']
})
export class AlergiesSettingsPage implements OnInit {
    user = new User();
    alergyInput = new UserAlergyDetail();

    constructor(
        private api: ApiService,
        private state: State,
        private loadingController: LoadingController
    ) {}

    ngOnInit() {}

    get alergies(): UserAlergyDetail[] {
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
    }

    onDeleteClicked(alergy: UserAlergyDetail) {
        const index = this.alergies.indexOf(alergy);
        this.alergies.splice(index, 1);
    }
}

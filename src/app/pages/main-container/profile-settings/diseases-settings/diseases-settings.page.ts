import { User, UserDiseaseDetail } from 'src/app/views';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { State } from 'src/app/state';

@Component({
    selector: 'app-diseases-settings',
    templateUrl: './diseases-settings.page.html',
    styleUrls: ['./diseases-settings.page.scss']
})
export class DiseasesSettingsPage implements OnInit {
    user = new User();
    diseaseInput = new UserDiseaseDetail();

    constructor(
        private api: ApiService,
        private state: State,
        private loadingController: LoadingController
    ) {}

    ngOnInit() {}

    get diseases(): UserDiseaseDetail[] {
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
    }

    onDeleteClicked(disease: UserDiseaseDetail) {
        const index = this.diseases.indexOf(disease);
        this.diseases.splice(index, 1);
    }
}

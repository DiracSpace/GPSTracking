import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { wait } from 'src/app/utils/time';

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {
    loading = false;
    user: any = {};

    constructor(private loadingController: LoadingController) {}

    ngOnInit() {
        this.loadUserAsync();
    }

    private async loadUserAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando datos del usuario'
        });
        await loadingDialog.present();
        await wait(500);
        this.user = {}; // TODO Get user from firestore
        await loadingDialog.dismiss();
        this.loading = false;
    }
}

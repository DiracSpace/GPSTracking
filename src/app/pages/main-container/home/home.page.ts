import { ApiService } from 'src/app/api/ApiService.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { Component, OnInit } from '@angular/core';
import { Navigation } from 'src/app/navigation';
import { User } from 'src/app/views';
import { formatToBlobName } from 'src/app/views/User/User';

const logger = new Logger({
    source: 'HomePage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    loading = false;
    user = new User();

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastController,
        private nav: Navigation,
        private api: ApiService
    ) {}

    ngOnInit(): void {
        this.loadAsync();
    }

    get qrCodeInformation() {
        return this.user.qrCodeUrl;
    }

    get qrCodeSrc() {
        return this.user.qrCodeBase64;
    }

    get username() {
        return this.user.username ?? this.user.email;
    }

    async onLogoutClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Cerrando Sesión'
        });
        await loadingDialog.present();
        await this.api.auth.signOut();
        await loadingDialog.dismiss();
        this.nav.login.go();
    }

    async onQrSrcObtained(qrSrc: Blob) {
        if (!qrSrc) {
            throw 'No source provided for upload to storage!';
        }

        if (this.user.qrCodeUrl.includes('firebasestorage')) {
            logger.log("Already uploaded to storage!");
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Generando el código QR'
        });
        await loadingDialog.present();

        try {
            const fileName = formatToBlobName(this.user.uid);
            const resourceUrl = await this.api.storage.uploadBlobWithProgressAsync(
                qrSrc,
                fileName
            );
            logger.log("resourceUrl:", resourceUrl);
            this.user.qrCodeUrl = resourceUrl;
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            const toast = await this.toasts.create({
                message: error,
                duration: 800
            });
            await toast.present();
        }

        await loadingDialog.dismiss();
    }

    onEditProfileClicked() {
        this.nav.mainContainer.profileSettings.go();
    }

    private async loadAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        const user = await this.api.auth.currentUser;

        if (!user) {
            await loadingDialog.dismiss();

            const toast = await this.toasts.create({
                message: 'No se pudo autenticar. Por favor vuelva a iniciar sesión',
                duration: 800
            });
            await toast.present();

            this.api.auth.signOut();
            this.nav.login.go();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }
}

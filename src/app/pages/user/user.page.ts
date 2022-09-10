import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { wait } from 'src/app/utils/time';
import { User, UserAddress } from 'src/app/views';
import { getAddressDescription } from 'src/app/views/User/UserAddress';
import { Assets } from 'src/assets';

const logger = new Logger({
    source: 'UserPage',
    level: LogLevel.Debug
})

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {
    loading = false;
    user: User;

    constructor(
        private loadingController: LoadingController,
        private api: ApiService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        if (this.userId) {
            this.loadUserAsync();
        }
    }

    get invalidContent() {
        return !this.userId || !this.user;
    }
    
    get invalidContentMessage() {
        if (!this.userId) {
            return 'Bad URL or no UserId provided';
        }

        if (!this.user) {
            return 'User not found';
        }
    }

    get userId(): string | undefined {
        const userId = this.activatedRoute.snapshot.params.id;
        return userId;
    }

    get userBannerImg() {
        if (!this.user.bannerUrl) {
            return Assets.banner;
        }

        return this.user.bannerUrl;
    }

    get userAvatarImg() {
        if (!this.user.photoUrl) {
            return Assets.avatar;
        }

        return this.user.photoUrl;
    }

    get fullName(): string {
        const parts: string[] = [];

        if (this.user.firstName) {
            parts.push(this.user.firstName);
        }

        if (this.user.middleName) {
            parts.push(this.user.middleName);
        }

        if (this.user.lastNameFather) {
            parts.push(this.user.lastNameFather);
        }

        if (this.user.lastNameMother) {
            parts.push(this.user.lastNameMother);
        }

        return parts.join(' ');
    }

    getAddressDescription(address: UserAddress) {
        return getAddressDescription(address);
    }

    private async loadUserAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando datos del usuario'
        });
        await loadingDialog.present();
        await wait(500);
        this.user = await this.api.users.getByUidOrDefaultAsync(this.userId);
        logger.log("this.user:", this.user);
        await loadingDialog.dismiss();
        this.loading = false;
    }
}

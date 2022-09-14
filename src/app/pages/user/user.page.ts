import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ActionSheetController,
    ActionSheetOptions,
    LoadingController
} from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { ContextService } from 'src/app/services/context.service';
import { PhotoService } from 'src/app/services/photo.service';
import { formatDate, wait } from 'src/app/utils/time';
import { User, UserAddress } from 'src/app/views';
import { getAddressDescription } from 'src/app/views/User/UserAddress';
import { Assets } from 'src/assets';

const logger = new Logger({
    source: 'UserPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {
    actionSheetOptions: ActionSheetOptions = {
        buttons: [
            {
                text: 'Eliminar la foto',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    console.log('Eliminar la foto de perfil!');
                }
            },
            {
                text: 'Tomarse una foto',
                icon: 'camera-outline',
                handler: async () => {
                    await this.photoService.takePictureAsync();
                }
            },
            {
                text: 'Elegir una foto',
                icon: 'images-outline',
                handler: () => {
                    this.context.openCloseProfileSelectorModal();
                }
            },
            {
                text: 'Cancelar',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancelar!');
                }
            }
        ]
    };

    loading = false;
    user: User;

    constructor(
        private actionSheetController: ActionSheetController,
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private photoService: PhotoService,
        private context: ContextService,
        private api: ApiService
    ) {}

    ngOnInit() {
        if (this.userId) {
            this.loadUserAsync();
        }
    }

    get invalidContent() {
        return !this.userId || !this.user;
    }

    get invalidContentMessage(): string {
        if (!this.userId) {
            return 'La URL es incorrecta';
        }

        if (!this.user) {
            return 'No se encontró al usuario';
        }

        return "Desconocido"
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

    async onClickOpenActions() {
        const actionSheet = await this.actionSheetController.create(
            this.actionSheetOptions
        );
        await actionSheet.present();
        const { role, data } = await actionSheet.onDidDismiss();
        logger.log('role:', role);
        logger.log('data:', data);
    }

    private async loadUserAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando datos del usuario'
        });
        await loadingDialog.present();
        this.user = await this.api.users.getByUidOrDefaultAsync(this.userId);

        if (!this.user) {
            throw 'No user was found!';
        }

        let photoName = `ProfilePicture_${this.user.uid}_`;
        this.context.photoName.set(photoName);

        logger.log('this.context.photoName.get():', this.context.photoName.get());
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }
}

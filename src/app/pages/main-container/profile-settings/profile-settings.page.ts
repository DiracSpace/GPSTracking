import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api';
import { Navigation } from 'src/app/navigation';
import { ToastsService } from 'src/app/services';

@Component({
    selector: 'app-profile-settings',
    templateUrl: './profile-settings.page.html',
    styleUrls: ['./profile-settings.page.scss']
})
export class ProfileSettingsPage implements OnInit {
    forms: FormItem[] = [
        {
            label: 'Nombre(s)',
            route: this.nav.mainContainer.profileSettings.names.path
        },
        {
            label: 'Números de Teléfono',
            route: this.nav.mainContainer.profileSettings.phoneNumbers.path
        },
        {
            label: 'Enfermedades',
            route: this.nav.mainContainer.profileSettings.diseases.path
        },
        {
            label: 'Alergias',
            route: this.nav.mainContainer.profileSettings.alergies.path
        },
        {
            label: 'Direcciones',
            route: this.nav.mainContainer.profileSettings.addresses.path
        }
    ];

    constructor(
        private toasts: ToastsService,
        private nav: Navigation,
        private router: Router,
        private api: ApiService
    ) {}

    ngOnInit() {}

    async onHomeClicked() {
        const { uid } = await this.api.auth.currentUser;
        const profileHasMissingValues =
            await this.api.users.userProfileHasMissingValuesAsync(uid);

        if (!profileHasMissingValues) {
            this.nav.mainContainer.home.go();
            return;
        }

        let message = '¡Aún no ha completado su perfil!';
        await this.toasts.presentToastAsync(message, 'danger');
    }

    onFormItemClicked(item: FormItem) {
        this.router.navigateByUrl(item.route);
    }
}

interface FormItem {
    label: string;
    route: string;
}

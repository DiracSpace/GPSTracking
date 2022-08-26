import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Navigation } from 'src/app/navigation';

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

    constructor(private nav: Navigation, private router: Router) {}

    ngOnInit() {}

    onFormItemClicked(item: FormItem) {
        this.router.navigateByUrl(item.route);
    }
}

interface FormItem {
    label: string;
    route: string;
}

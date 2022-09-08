import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/api/auth/auth.service';
import { Navigation } from 'src/app/navigation';

export const userLocationsSubject = new BehaviorSubject<number>(0);
export const userLocations = {
    get: () => userLocationsSubject.value,
    set: (value: number) => userLocationsSubject.next(value)
};

@Component({
    selector: 'app-bottom-navigation',
    templateUrl: './bottom-navigation.component.html',
    styleUrls: ['./bottom-navigation.component.scss']
})
export class BottomNavigationComponent implements OnInit {
    constructor(private nav: Navigation, private auth: AuthService) {}

    ngOnInit() {}

    get locations() {
        return userLocations.get();
    }

    async onUbicacionesClicked() {
        const { uid } = await this.auth.currentUser;
        this.nav.locations(uid).go();
    }

    onConfiguracionesClicked() {
        this.nav.mainContainer.profileSettings.go();
    }

    async onPerfilClicked() {
        const { uid } = await this.auth.currentUser;
        this.nav.user(uid).go();
    }
}

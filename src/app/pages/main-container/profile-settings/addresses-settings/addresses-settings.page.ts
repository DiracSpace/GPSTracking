import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import {
    ArgumentNullError,
    NotImplementedError,
    RequiredPropError
} from 'src/app/errors';
import { State } from 'src/app/state';
import { wait } from 'src/app/utils/time';
import { AddressTypeTypes, MexicoStates, User, UserAddress } from 'src/app/views';

@Component({
    selector: 'app-addresses-settings',
    templateUrl: './addresses-settings.page.html',
    styleUrls: ['./addresses-settings.page.scss']
})
export class AddressesSettingsPage implements OnInit {
    addressTypes = AddressTypeTypes;
    user = new User();
    states = MexicoStates;

    constructor(
        private api: ApiService,
        private state: State,
        private loadingController: LoadingController
    ) {}

    ngOnInit() {}

    get addresses(): UserAddress[] {
        if (this.user.addresses == undefined || this.user.addresses == null) {
            return [];
        }

        return this.user.addresses;
    }

    get defaultAddress(): UserAddress {
        return this.addresses.find((x) => x.isDefault);
    }

    async onAddClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Añadiendo...'
        });

        await loadingDialog.present();

        await wait(500); // TODO Remove this

        const address = new UserAddress();
        this.addresses.push(address);
        // TODO Add to firestore
        // TODO Add to app state

        await loadingDialog.dismiss();
    }

    async onDeleteClick(address: UserAddress) {
        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.addresses, 'addresses', caller);

        const index = this.addresses.indexOf(address);

        if (index == -1) {
            throw new NotImplementedError('Could not find address to delete', caller);
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Eliminando...'
        });

        await loadingDialog.present();

        await wait(500); // TODO Remove this
        // TODO Delete from firestore
        // TODO Delete from app state
        this.addresses.splice(index, 1);

        await loadingDialog.dismiss();
    }

    async onSaveClicked(address: UserAddress) {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });

        await loadingDialog.present();

        await wait(500); // TODO Remove this
        // TOOD Update in firestore
        // TODO Update in app state

        await loadingDialog.dismiss();
    }

    getAddressDescription(address: UserAddress): string {
        const caller = 'getAddressDescription';
        ArgumentNullError.throwIfNull(address, 'address', caller);

        const parts: string[] = [];

        if (address.street) {
            parts.push(address.street);
        }

        if (address.numberExternal) {
            parts.push(`#${address.numberExternal}`);
        }

        if (address.neighbourhood) {
            parts.push(address.neighbourhood);
        }

        if (address.county) {
            parts.push(address.county);
        }

        if (address.state) {
            parts.push(address.state);
        }

        if (address.zipCode) {
            parts.push(address.zipCode.toString());
        }

        if (parts.length > 0) {
            return parts.join(', ');
        }

        return 'Desconocido';
    }
}

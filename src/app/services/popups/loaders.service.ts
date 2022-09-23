import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoadersService {
    constructor(private loadingController: LoadingController) {}

    async showAsync(message: string): Promise<HTMLIonLoadingElement> {
        const loader = await this.loadingController.create({ message });
        await loader.present();
        return loader;
    }
}

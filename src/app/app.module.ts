import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QrCodeModule } from './qr-code/qr-code.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import {
    provideFirestore,
    getFirestore,
    enableIndexedDbPersistence
} from '@angular/fire/firestore';
import { Logger, LogLevel } from './logger';

const logger = new Logger({
    source: 'AppModule',
    level: LogLevel.Debug
});

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            mode: 'ios'
        }),
        AppRoutingModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        QrCodeModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideDatabase(() => getDatabase()),
        provideFirestore(() => {
            const firestore = getFirestore();
            try {
                enableIndexedDbPersistence(firestore);
            } catch (error) {
                let message = '';
                
                switch (error.code) {
                    case 'failed-precondition':
                        message = `El correo electrónico no está disponible.`;
                        logger.log(message);
                        break;
                    case 'unimplemented':
                        message = `El correo electrónico no tiene el formato adecuado.`;
                        logger.log(message);
                        break;
                    default:
                        message = error.message;
                        logger.log(message);
                        break;
                }

                throw message;
            }
            
            return firestore;
        })
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent]
})
export class AppModule {}

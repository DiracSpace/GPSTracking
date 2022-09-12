import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage } from '@angular/fire/storage';
import {
    provideFirestore,
    getFirestore,
    enableIndexedDbPersistence
} from '@angular/fire/firestore';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { ErrorHandlerService } from './services/error-handler.service';
import { Logger, LogLevel } from './logger';

import { HttpClientModule } from '@angular/common/http';

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
        HttpClientModule,
        provideAuth(() => getAuth()),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideDatabase(() => getDatabase()),
        provideStorage(() => getStorage()),
        provideFirestore(() => {
            const firestore = getFirestore();
            try {
                enableIndexedDbPersistence(firestore);
                logger.log("Cache active!");
            } catch (error) {
                let message = '';

                switch (error.code) {
                    case 'failed-precondition':
                        message = `No hay acceso al servicio de cache de Firebase.`;
                        logger.log(message);
                        break;
                    case 'unimplemented':
                        message = `No está implementado el servicio de cache de Firebase.`;
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
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        {
            provide: ErrorHandler,
            useClass: ErrorHandlerService
        },
        AndroidPermissions,
        Geolocation,
        LocationAccuracy
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}

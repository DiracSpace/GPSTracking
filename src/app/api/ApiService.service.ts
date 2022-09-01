import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { BackgroundLocationService } from './location/background-location.service';
import { LocationService } from './location/location.service';
import { StorageService } from './storage/storage.service';
import { UserService } from './users/user.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(
        public users: UserService,
        public auth: AuthService,
        public storage: StorageService,
        public location: LocationService,
        public backgroundLocation: BackgroundLocationService,
    ) {}
}

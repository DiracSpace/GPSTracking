import { UserDiseaseDetail } from './UserDiseaseDetail';
import { UserAlergyDetail } from './UserAlergyDetail';
import { UserPhoneNumber } from './UserPhoneNumber';
import { UserAddress } from './UserAddress';

export class User {
    uid: string;
    username: string;
    pin: number;

    firstName: string;
    middleName: string;
    lastNameFather: string;
    lastNameMother: string;

    emailVerified: boolean;
    email: string;

    photoUrl: string;
    bannerUrl: string;
    qrCodeUrl: string;
    qrCodeBase64: string;

    phoneNumbers: UserPhoneNumber[];
    addresses: UserAddress[];

    diseases: UserDiseaseDetail[];
    alergies: UserAlergyDetail[];

    constructor() {
        this.phoneNumbers = [];
        this.addresses = [];
        this.diseases = [];
        this.alergies = [];
    }
}

export function formatToBlobName(uid: string, format: string = 'png'): string {
    if (!uid) {
        throw 'uid not provided for formatting qr code name.';
    }

    if (format.includes('.')) {
        throw 'qr code format name should not include a ".".';
    }

    return `${uid}.${format}`;
}

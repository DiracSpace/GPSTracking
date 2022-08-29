import { UserDiseaseDetail } from './UserDiseaseDetail';
import { UserAlergyDetail } from './UserAlergyDetail';
import { UserPhoneNumber } from './UserPhoneNumber';
import { UserAddress } from './UserAddress';

export class User {
    uid: string;
    username: string;

    firstName: string;
    middleName: string;
    lastNameFather: string;
    lastNameMother: string;

    emailVerified: boolean;
    email: string;
    photoUrl: string;
    qrCodeUrl: string;

    phoneNumbers: UserPhoneNumber[];
    addresses: UserAddress[];

    diseases: UserDiseaseDetail[];
    alergies: UserAlergyDetail[];

    constructor() {
        this.phoneNumbers = [];
        this.addresses = [];
        this.alergies = [];
    }
}

import { UserStorageDetail } from './UserStorageDetail';
import { UserDiseaseDetail } from './UserDiseaseDetail';
import { UserAlergyDetail } from './UserAlergyDetail';
import { UserPhoneNumber } from './UserPhoneNumber';
import { empty } from 'src/app/utils/strings';
import { UserAddress } from './UserAddress';
import { UserEmail } from './UserEmail';
import { guid } from 'src/app/utils';

export class User {
    uid: string;
    username: string;

    firstName: string;
    middleName: string;
    lastNameFather: string;
    lastNameMother: string;

    emails: UserEmail[];
    phoneNumbers: UserPhoneNumber[];
    storageDetails: UserStorageDetail;
    addresses: UserAddress[];

    diseases: UserDiseaseDetail[];
    alergies: UserAlergyDetail[];

    constructor() {
        this.uid = guid();
        this.username = empty();
        this.firstName = empty();
        this.middleName = empty();
        this.lastNameFather = empty();
        this.lastNameMother = empty();

        this.emails = [];
        this.phoneNumbers = [];
        this.storageDetails = new UserStorageDetail();
        this.addresses = [];
        this.alergies = [];
    }
}

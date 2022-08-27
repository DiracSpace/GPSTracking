import { UserStorageDetail } from './UserStorageDetail';
import { UserDiseaseDetail } from './UserDiseaseDetail';
import { UserAlergyDetail } from './UserAlergyDetail';
import { UserPhoneNumber } from './UserPhoneNumber';
import { UserAddress } from './UserAddress';
import { UserEmail } from './UserEmail';

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
}

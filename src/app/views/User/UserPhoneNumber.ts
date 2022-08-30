import { PhoneNumberOwner } from '..';

export class UserPhoneNumber {
    id: string;

    number: string;
    isDefault: boolean;
    owner?: PhoneNumberOwner;

    /** Only available if the "owner" property is "Otro" */
    ownerOther?: string;

    /** Only available if the "owner" property is not "Mío" */
    ownerName?: string;
}

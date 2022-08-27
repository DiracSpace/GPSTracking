import { guid } from 'src/app/utils';

export class User {
  id: string;
  username: string;
  pin: number;
  names?: string;
  lastNameFather?: string;
  lastNameMother?: string;
  phoneNumbers?: PhoneNumber[];
  diseases?: string[];
  alergies?: string[];
  addresses?: Address[];

  constructor() {
    this.phoneNumbers = [];
    this.diseases = [];
    this.alergies = [];
    this.addresses = [];
  }
}

export class PhoneNumber {
  readonly id: string;

  number?: string;
  owner?: PhoneNumberOwner;

  /** Only available if the "owner" property is "Otro" */
  ownerOther?: string;

  /** Only available if the "owner" property is not "Mío" */
  ownerName?: string;

  _expanded?: boolean;

  constructor() {
    this.id = guid();
  }
}

export type PhoneNumberOwner = 'Mío' | 'Mamá' | 'Papá' | 'Otro';

export const PhoneNumberOwnerTypes: PhoneNumberOwner[] = ['Mío', 'Mamá', 'Papá', 'Otro'];

export class Address {
  state?: string; // Estado
  county?: string; // Ciudad/Municipio
  neighbourhood?: string; // Colonia
  street?: string;
  numberExternal?: number;
  numberInternal?: number;
  betweenStreet1?: string;
  betweenStreet2?: string;
  zipCode?: number; // Codigo Postal
  addressType?: string;
  additionalInstructions?: string;
}

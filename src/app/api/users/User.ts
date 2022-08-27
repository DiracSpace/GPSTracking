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

  constructor() {
    this.id = guid();
  }
}

export type PhoneNumberOwner = 'Mío' | 'Mamá' | 'Papá' | 'Otro';

export const PhoneNumberOwnerTypes: PhoneNumberOwner[] = ['Mío', 'Mamá', 'Papá', 'Otro'];

export class Address {
  readonly id: string;

  state?: string; // Estado
  county?: string; // Ciudad/Municipio
  neighbourhood?: string; // Colonia
  street?: string;
  numberExternal?: number;
  numberInternal?: number;
  betweenStreet1?: string;
  betweenStreet2?: string;
  zipCode?: number; // Codigo Postal
  addressType?: string; //
  additionalInstructions?: string;

  constructor() {
    this.id = guid();
  }
}

export const MexicoStates = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Coahuila de Zaragoza',
  'Colima',
  'Ciudad de México',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Estado de Mexico',
  'Michoacan de Ocampo',
  'Morelos',
  'Nayarit',
  'Nuevo Leon',
  'Oaxaca',
  'Puebla',
  'Queretaro de Arteaga',
  'Quintana Roo',
  'San Luis Potosi',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz de Ignacio de la Llave',
  'Yucatan',
  'Zacatecas'
];

export type AddressType = 'Hogar' | 'Trabajo' | 'Otro';

export const AddressTypeTypes: AddressType[] = ['Hogar', 'Trabajo', 'Otro'];

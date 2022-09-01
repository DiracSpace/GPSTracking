/* #region UserEntity */
export { UserStorageDetail } from './User/UserStorageDetail';
export { UserDiseaseDetail } from './User/UserDiseaseDetail';
export { UserAlergyDetail } from './User/UserAlergyDetail';
export { UserPhoneNumber } from './User/UserPhoneNumber';
export { UserAddress } from './User/UserAddress';
export { UserEmail } from './User/UserEmail';
export { User } from './User/User';
/* #endregion */

export { Location } from './Location/Location';

export {
    FirebaseEntityConverter,
    ListEntityConverter,
    EntityConverter
} from './FirestoreConverter/EntityConverter';

export const PhoneNumberOwnerTypes: PhoneNumberOwner[] = ['Mío', 'Mamá', 'Papá', 'Otro'];
export const AddressTypeTypes: AddressType[] = ['Hogar', 'Trabajo', 'Otro'];
export type PhoneNumberOwner = 'Mío' | 'Mamá' | 'Papá' | 'Otro';
export type AddressType = 'Hogar' | 'Trabajo' | 'Otro';

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

import { CardItem } from 'src/app/core/components/card-item/card-item.component';

export const UserBasicInformationCardItem: CardItem = {
    primaryTitle: 'Información Básica',
    icon: 'person'
};

export const UserAddressInformationCardItem: CardItem = {
    primaryTitle: 'Dirección',
    icon: 'home'
};

export const UserLocationsInformationCardItem: CardItem = {
    primaryTitle: 'Historial de Ubicaciones',
    icon: 'location'
};

export const UserPhoneNumberInformationCardItem: CardItem = {
    primaryTitle: 'Números de Teléfono',
    icon: 'call'
};

export const UserDiseaseInformationCardItem: CardItem = {
    primaryTitle: 'Enfermedades',
    icon: 'fitness'
};

export const UserAlergyInformationCardItem: CardItem = {
    primaryTitle: 'Alergias',
    icon: 'pulse'
};

export const UserProfileCardItems: CardItem[] = [
    UserLocationsInformationCardItem,
    UserBasicInformationCardItem,
    UserAddressInformationCardItem,
    UserPhoneNumberInformationCardItem,
    UserDiseaseInformationCardItem,
    UserAlergyInformationCardItem
];

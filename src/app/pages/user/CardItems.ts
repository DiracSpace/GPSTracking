import { CardItem } from "src/app/core/components/card-item/card-item.component";

export const UserBasicInformationCardItem: CardItem = {
    primaryTitle: "Información Básica",
    icon: "person"
}

export const UserAddressInformationCardItem: CardItem = {
    primaryTitle: "Dirección",
    icon: "home"
}

export const UserProfileCardItems: CardItem[] = [
    UserBasicInformationCardItem,
    UserAddressInformationCardItem
];
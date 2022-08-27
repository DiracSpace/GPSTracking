export class UserAddress {
    isDefault: boolean;
    uid: string;

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
}
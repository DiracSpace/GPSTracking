import { ArgumentNullError } from 'src/app/errors';

export class UserAddress {
    isDefault: boolean;
    id: string;

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

export function getUserAddressDescription(address: UserAddress): string {
    const caller = 'getAddressDescription';
    ArgumentNullError.throwIfNull(address, 'address', caller);

    const parts: string[] = [];

    if (address.street) {
        parts.push(address.street);
    }

    if (address.numberExternal) {
        parts.push(`#${address.numberExternal}`);
    }

    if (address.neighbourhood) {
        parts.push(address.neighbourhood);
    }

    if (address.county) {
        parts.push(address.county);
    }

    if (address.state) {
        parts.push(address.state);
    }

    if (address.zipCode) {
        parts.push(address.zipCode.toString());
    }

    if (parts.length > 0) {
        return parts.join(', ');
    }

    return 'Desconocido';
}

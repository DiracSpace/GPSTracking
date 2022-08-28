import { empty } from "src/app/utils/strings";

export class UserStorageDetail {
    photoUrl: string;
    qrCodeUrl: string;

    constructor() {
        this.photoUrl = empty();
        this.qrCodeUrl = empty();
    }
}
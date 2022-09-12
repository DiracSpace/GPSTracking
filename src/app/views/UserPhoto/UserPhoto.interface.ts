export class UserPhoto {
    firebaseStoragePath?: string;

    webViewPath?: string;
    filepath?: string;
    blob?: Blob;

    // Used to determine if photo saved in localStorage has
    // been uploaded to firebase
    _hasBeenUploaded: boolean;

    // Used to determine if photo is being saved
    // in cache
    _isCached: boolean;

    constructor() {
        this._hasBeenUploaded = false;
        this._isCached = true;
    }
}
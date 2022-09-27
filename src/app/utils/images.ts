export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        const result = reader.result as string;
        console.log('reader.result:', reader.result);
        reader.onloadend = () => resolve(result);
        reader.readAsDataURL(blob);
    });
}

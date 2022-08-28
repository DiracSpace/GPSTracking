import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';

// This helper function pipes your types through a firestore converter
export const FirebaseEntityConverter = <T>() => ({
    toFirestore: (entity: T): DocumentData => {
        const json = JSON.stringify(entity);
        return JSON.parse(json);
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T
});

export const EntityConverter = {
    fromFirestore: <T>(entity: any): T => entity as T,
}
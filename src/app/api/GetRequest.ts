import { QueryConstraint } from '@angular/fire/firestore';

export class GetRequest {
    query?: QueryConstraint[];
    pageIndex?: number;
    pageSize?: number;
}

import { Injectable } from '@angular/core';
import { UserService } from './users/user.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(public users: UserService) {}
}

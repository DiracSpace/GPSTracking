import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../views';

@Injectable({ providedIn: 'root' })
export class State {
  constructor() {}

  private readonly tokenSubject = new BehaviorSubject<string>(null);
  token = {
    get: () => this.tokenSubject.value,
    set: (value: string) => this.tokenSubject.next(value),
    remove: () => this.tokenSubject.next(null)
  };

  private readonly userSubject = new BehaviorSubject<User>(null);
  user = {
    get: () => this.userSubject.value,
    set: (value: User) => this.userSubject.next(value),
    remove: () => this.userSubject.next(null)
  };
}

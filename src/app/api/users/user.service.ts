import { Injectable } from '@angular/core';
import { User } from './User';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor() {}

  async getByIdAsync(id: string): Promise<User> {
    // TODO Get user from firestore
    const user = new User();
    user.id = '630a64c6f785abe9ee24a4a1';
    user.username = 'User';
    user.pin = 1234;
    return user;
  }
}

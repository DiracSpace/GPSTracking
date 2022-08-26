import { IRepository } from '../IRepository.interface';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { Users } from 'src/app/views';

const logger = new Logger({
    source: 'UserService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class UserService implements IRepository<Users> {
    constructor() {}
    createAsync<T>(entity: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    createAllAsync<T>(entities: T[]): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
    getAsync<T>(entityId: number): Promise<T> {
        throw new Error('Method not implemented.');
    }
    getAllAsync<T>(): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
    deleteAsync<T>(entityId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deleteAllAsync<T>(entityIds: number[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    updateAsync<T>(entityId: number, entities: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    updateAllAsync<T>(entities: T[]): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
}

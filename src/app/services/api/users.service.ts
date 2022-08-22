import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { IRepository } from '../IRepository.interface';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { Users } from 'src/app/views';
import { Tables } from 'src/app/views/database/tables';

const logger = new Logger({
    source: 'UserService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class UserService implements IRepository<Users> {
    private client: SupabaseClient;
    token: string | undefined;

    constructor() {
        this.client = createClient(
            environment.supabase.supabaseUrl,
            environment.supabase.supabaseKey
        );
    }

    async createAsync<Users>(entity: Users): Promise<Users> {
        const { data, error } = await this.client
            .from<Users>(Tables.supabase.UsersTable)
            .insert(entity)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async createAllAsync<Users>(entities: Users[]): Promise<Users[]> {
        const { data, error } = await this.client
            .from<Users>(Tables.supabase.UsersTable)
            .insert(entities);

        if (error) {
            throw error;
        }

        return data;
    }

    getAsync<T>(entityId: number): Promise<T> {
        // const { data, error } = await this.client
        //     .from<Users>(Tables.supabase.UsersTable)
        //     .select('*')
        //     .eq('id', entityId) // TODO: issue here
        //     .single();

        // if (error) {
        //     throw error;
        // }

        // return data;

        throw new Error('Method not implemented.');
    }

    async getAllAsync<Users>(): Promise<Users[]> {
        const { data, error } = await this.client
            .from<Users>(Tables.supabase.UsersTable)
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    }

    async deleteAsync<Users>(entityId: number): Promise<void> {
        // const { data, error } = await this.client
        //     .from<Users>(Tables.supabase.UsersTable)
        //     .delete()
        //     .eq('id', entityId); // TODO: issue here

        // if (error) {
        //     throw error;
        // }
    }

    async deleteAllAsync<Users>(entityIds: number[]): Promise<void> {
        // const { data, error } = await this.client
        //     .from<Users>(Tables.supabase.UsersTable)
        //     .delete()
        //     .eq('id', entityIds); // TODO: issue here

        // if (error) {
        //     throw error;
        // }
    }

    updateAsync<T>(entityId: number, entities: T): Promise<T> {
        throw new Error('Method not implemented.');
    }

    updateAllAsync<T>(entities: T[]): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
}

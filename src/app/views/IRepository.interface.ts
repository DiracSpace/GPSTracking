export interface IRepository<T> {
    createAsync<T>(entity: T): Promise<T>;
    createAllAsync<T>(entities: T[]): Promise<T[]>;
    getAsync<T>(entityId: number): Promise<T>;
    getAllAsync<T>(): Promise<T[]>;
    deleteAsync<T>(entityId: number): Promise<void>;
    deleteAllAsync<T>(entityIds: number[]): Promise<void>;
    updateAsync<T>(entityId: number, entities: T): Promise<T>;
    updateAllAsync<T>(entities: T[]): Promise<T[]>;
}
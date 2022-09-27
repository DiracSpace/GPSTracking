export interface IRepository<T> {
    createAsync<T>(entity: T): Promise<void>;
    createAllAsync<T>(entities: T[]): Promise<void>;
    getAsync<T>(entityId: number): Promise<T>;
    getAllAsync<T>(): Promise<T[]>;
    deleteAsync<T>(entityId: number): Promise<void>;
    deleteAllAsync<T>(entityIds: number[]): Promise<void>;
    updateAsync<T>(entityId: number, entities: T): Promise<T>;
    updateAllAsync<T>(entities: T[]): Promise<T[]>;
}

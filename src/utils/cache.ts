type cacheItem<T> = {
    data: T,
    expiry: number
}

const cache = new Map<string, cacheItem<any>>();

export const setCache = <T>(key: string, data: T, ttl: number) => {
    const expiry = Date.now() + ttl;

    cache.set(key, {data, expiry});
}

export const getCache = <T>(key: string) : T | null => {
    const item = cache.get(key);
    if(!item) return null;
    if(Date.now() > item.expiry){
        cache.delete(key);
        return null
    }

    return item?.data as T;
}
type cacheItem<T> = {
    data: T,
    expiry: number
}

const cache = new Map<string, cacheItem<any>>();

export const setCache = <T>(key: string, data: T, ttl: number) => {
    const expiry = Date.now() + ttl;

    cache.set(key, {data, expiry});
}
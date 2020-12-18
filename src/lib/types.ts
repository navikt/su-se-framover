export type Nullable<T> = T | null;
export type KeyDict<T> = T extends number ? never : { [key in keyof T]: key };

export function keyOf<T>(s: keyof T) {
    return s;
}

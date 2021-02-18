import { Eq, fromEquals } from 'fp-ts/lib/Eq';

export type Nullable<T> = T | null;
export type KeyDict<T> = T extends number ? never : { [key in keyof T]: key };

export function keyOf<T>(s: keyof T) {
    return s;
}

export function eqNullable<T>(eqT: Eq<T>): Eq<Nullable<T>> {
    return fromEquals<Nullable<T>>(
        (x, y) => x === y || (x === null && y === null) || (x !== null && y !== null && eqT.equals(x, y))
    );
}

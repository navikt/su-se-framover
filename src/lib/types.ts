import { Eq, fromEquals } from 'fp-ts/lib/Eq';

import { BooleanMedBegrunnelse, SvarMedBegrunnelse } from '~src/pages/klage/vurderFormkrav/VurderFormkrav';

export type Nullable<T> = T | null;

export function isNotNullable<T>(x: Nullable<T>): x is T {
    return x !== null;
}

export function keyOf<T>(s: keyof T) {
    return s;
}

export function eqNullable<T>(eqT: Eq<T>): Eq<Nullable<T>> {
    return fromEquals<Nullable<T>>(
        (x, y) => x === y || (x === null && y === null) || (x !== null && y !== null && eqT.equals(x, y)),
    );
}

export const eqSvarMedBegrunnelse: Eq<SvarMedBegrunnelse> = fromEquals(
    (a, b) => a.svar === b.svar && a.begrunnelse === b.begrunnelse,
);

export const eqBooleanMedBegrunnelse: Eq<BooleanMedBegrunnelse> = fromEquals(
    (a, b) => a.svar === b.svar && a.begrunnelse === b.begrunnelse,
);

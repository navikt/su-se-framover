import { Nullable } from '~lib/types';

import { Periode } from './Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
    begrunnelse: string;
    oppfylt: Oppfylt;
}

export enum Oppfylt {
    JA = 'JA',
    NEI = 'NEI',
    UAVKLART = 'UAVKLART',
}

export interface Grunnlag {
    uføre: Uføregrunnlag[];
}

// TODO jah: Dette mapper ikke nødvendigvis helt med backenden, siden vi ikke har bestemt oss om vi skal returnere hele grunnlaget eller kun det for uføre.
export interface SimulertEndringGrunnlag {
    førBehandling: Grunnlag;
    endring: Grunnlag;
    resultat: Grunnlag;
}

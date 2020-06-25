export enum Bosituasjon {
    BorAleneEllerMedBarnUnder18 = 'bor-alene-med-barn-under-18',
    BorMedNoenOver18 = 'bor-med-noen-over-18',
}

export type TypeOppholdstillatelse = 'permanent' | 'midlertidig';

export type Svarform = 'brev' | 'digitalt';

export type Vergemål = 'fullmektig' | 'verge';

export type DelerBoligMed = 'ektemake-eller-samboer' | 'barn-over-18' | 'andre';

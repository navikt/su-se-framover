import { struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';

import { Periode } from './Periode';

export interface LagreFradragsgrunnlangInnsending {
    periode: Nullable<Periode<string>>;
    kategori: Fradragskategori;
    spesifisertKategori: Nullable<string>;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}

export interface Fradrag {
    periode: Nullable<Periode<string>>;
    fradragskategoriWrapper: FradragskategoriWrapper;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}

interface FradragskategoriWrapper {
    kategori: Fradragskategori;
    spesifisertKategori: Nullable<string>;
}

const eqUtenlandskInntekt = struct<UtenlandskInntekt>({
    beløpIUtenlandskValuta: N.Eq,
    kurs: N.Eq,
    valuta: S.Eq,
});

const eqFradragskategoriWrapper = struct<FradragskategoriWrapper>({
    kategori: S.Eq,
    spesifisertKategori: eqNullable(S.Eq),
});

export const eqFradragBortsettFraPeriode = struct<Omit<Fradrag, 'periode'>>({
    fradragskategoriWrapper: eqFradragskategoriWrapper,
    beløp: N.Eq,
    utenlandskInntekt: eqNullable(eqUtenlandskInntekt),
    tilhører: S.Eq,
});

export interface UtenlandskInntekt {
    beløpIUtenlandskValuta: number;
    valuta: string;
    kurs: number;
}

export enum FradragTilhører {
    Bruker = 'BRUKER',
    EPS = 'EPS',
}

export type Fradragskategori = VelgbareFradragskategorier | IkkeVelgbareFradragskategorier;

export enum VelgbareFradragskategorier {
    Sosialstønad = 'Sosialstønad',
    Uføretrygd = 'Uføretrygd',
    Alderspensjon = 'Alderspensjon',
    Arbeidsavklaringspenger = 'Arbeidsavklaringspenger',
    Dagpenger = 'Dagpenger',
    SupplerendeStønad = 'SupplerendeStønad',
    //AFP
    AvtalefestetPensjon = 'AvtalefestetPensjon',
    AvtalefestetPensjonPrivat = 'AvtalefestetPensjonPrivat',

    Sykepenger = 'Sykepenger',
    Gjenlevendepensjon = 'Gjenlevendepensjon',
    Arbeidsinntekt = 'Arbeidsinntekt',
    OffentligPensjon = 'OffentligPensjon',
    Introduksjonsstønad = 'Introduksjonsstønad',
    Kvalifiseringsstønad = 'Kvalifiseringsstønad',
    PrivatPensjon = 'PrivatPensjon',
    Kontantstøtte = 'Kontantstøtte',
    BidragEtterEkteskapsloven = 'BidragEtterEkteskapsloven',
    Kapitalinntekt = 'Kapitalinntekt',
    Annet = 'Annet',
}

export enum IkkeVelgbareFradragskategorier {
    NAVytelserTilLivsopphold = 'NAVytelserTilLivsopphold',
    ForventetInntekt = 'ForventetInntekt',
    BeregnetFradragEPS = 'BeregnetFradragEPS',
    UnderMinstenivå = 'UnderMinstenivå',
    AvkortingUtenlandsopphold = 'AvkortingUtenlandsopphold',
}

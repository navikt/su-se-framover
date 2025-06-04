import { struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';
import isEqual from 'lodash.isequal';

import { eqNullable, Nullable } from '~src/lib/types';

import { Periode } from './Periode';

export interface Fradrag {
    periode: Periode<string>;
    type: Fradragskategori;
    beskrivelse: Nullable<string>;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}

export const fradragErlik = (ny: Fradrag[], gammel: Fradrag[]) => isEqual(ny, gammel);

const eqUtenlandskInntekt = struct<UtenlandskInntekt>({
    beløpIUtenlandskValuta: N.Eq,
    kurs: N.Eq,
    valuta: S.Eq,
});

export const eqFradragBortsettFraPeriode = struct<Omit<Fradrag, 'periode'>>({
    type: S.Eq,
    beskrivelse: eqNullable(S.Eq),
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
    StatensLånekasse = 'StatensLånekasse',
    Sosialstønad = 'Sosialstønad',
    Uføretrygd = 'Uføretrygd',
    Alderspensjon = 'Alderspensjon',
    Arbeidsavklaringspenger = 'Arbeidsavklaringspenger',
    Dagpenger = 'Dagpenger',
    SupplerendeStønad = 'SupplerendeStønad',
    //AFP
    AvtalefestetPensjon = 'AvtalefestetPensjon',
    AvtalefestetPensjonPrivat = 'AvtalefestetPensjonPrivat',

    Tiltakspenger = 'Tiltakspenger',
    Ventestønad = 'Ventestønad',
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
    Fosterhjemsgodtgjørelse = 'Fosterhjemsgodtgjørelse',
    Annet = 'Annet',
}

export enum IkkeVelgbareFradragskategorier {
    NAVytelserTilLivsopphold = 'NAVytelserTilLivsopphold',
    ForventetInntekt = 'ForventetInntekt',
    BeregnetFradragEPS = 'BeregnetFradragEPS',
    UnderMinstenivå = 'UnderMinstenivå',
}

/**
 * Dokumentasjon over hvilke fradragskategorier som reguleres finnes på:
 * https://confluence.adeo.no/display/TESUS/G-regulering
 */
export const måReguleresManuelt = (fradrag: Fradragskategori): boolean => {
    switch (fradrag) {
        case VelgbareFradragskategorier.Alderspensjon:
        case VelgbareFradragskategorier.Arbeidsavklaringspenger:
        case VelgbareFradragskategorier.AvtalefestetPensjon:
        case VelgbareFradragskategorier.AvtalefestetPensjonPrivat:
        case VelgbareFradragskategorier.Dagpenger:
        case VelgbareFradragskategorier.Fosterhjemsgodtgjørelse:
        case VelgbareFradragskategorier.Gjenlevendepensjon:
        case VelgbareFradragskategorier.Introduksjonsstønad:
        case VelgbareFradragskategorier.Kvalifiseringsstønad:
        case VelgbareFradragskategorier.OffentligPensjon:
        case VelgbareFradragskategorier.SupplerendeStønad:
        case VelgbareFradragskategorier.Uføretrygd:
        case VelgbareFradragskategorier.Tiltakspenger:
        case VelgbareFradragskategorier.Ventestønad:
        case IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold:
            return true;
        case VelgbareFradragskategorier.Annet:
        case VelgbareFradragskategorier.Sykepenger:
        case VelgbareFradragskategorier.Arbeidsinntekt:
        case VelgbareFradragskategorier.Kapitalinntekt:
        case VelgbareFradragskategorier.PrivatPensjon:
        case VelgbareFradragskategorier.Kontantstøtte:
        case VelgbareFradragskategorier.BidragEtterEkteskapsloven:
        case VelgbareFradragskategorier.Sosialstønad:
        case VelgbareFradragskategorier.StatensLånekasse:
        case IkkeVelgbareFradragskategorier.ForventetInntekt:
        case IkkeVelgbareFradragskategorier.BeregnetFradragEPS:
        case IkkeVelgbareFradragskategorier.UnderMinstenivå:
            return false;
    }
};

export interface Fradragsgrunnlagrequest {
    sakId: string;
    behandlingId: string;
    fradrag: Fradrag[];
}

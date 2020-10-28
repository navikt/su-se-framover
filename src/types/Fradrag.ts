import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
}

export interface UtenlandskInntekt {
    beløpIUtenlandskValuta: number;
    valuta: string;
    kurs: number;
}

export enum Fradragstype {
    NAVytelserTilLivsopphold = 'NAVytelserTilLivsopphold',
    Arbeidsinntekt = 'Arbeidsinntekt',
    OffentligPensjon = 'OffentligPensjon',
    PrivatPensjon = 'PrivatPensjon',
    Sosialstønad = 'Sosialstønad',
    Kontantstøtte = 'Kontantstøtte',
    Introduksjonsstønad = 'Introduksjonsstønad',
    Kvalifiseringsstønad = 'Kvalifiseringsstønad',
    BidragEtterEkteskapsloven = 'BidragEtterEkteskapsloven',
    Kapitalinntekt = 'Kapitalinntekt',
    ForventetInntekt = 'ForventetInntekt',
}

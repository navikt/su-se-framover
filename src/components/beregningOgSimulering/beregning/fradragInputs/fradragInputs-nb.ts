import { IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';

const velgbareFradragskategoriMessages: { [key in VelgbareFradragskategorier]: string } = {
    [VelgbareFradragskategorier.Sosialstønad]: 'Sosialstønad',
    [VelgbareFradragskategorier.Uføretrygd]: 'Uføretrygd',
    [VelgbareFradragskategorier.Alderspensjon]: 'Alderspensjon',
    [VelgbareFradragskategorier.Arbeidsavklaringspenger]: 'Arbeidsavklaringspenger',
    [VelgbareFradragskategorier.Dagpenger]: 'Dagpenger',
    [VelgbareFradragskategorier.SupplerendeStønad]: 'Supplerende stønad',
    [VelgbareFradragskategorier.AvtalefestetPensjon]: 'Avtalefestet pensjon (AFP)',
    [VelgbareFradragskategorier.AvtalefestetPensjonPrivat]: 'Avtalefestet pensjon privat (AFP)',
    [VelgbareFradragskategorier.Sykepenger]: 'Sykepenger',
    [VelgbareFradragskategorier.Gjenlevendepensjon]: 'Gjenlevendepensjon',
    [VelgbareFradragskategorier.Arbeidsinntekt]: 'Arbeidsinntekt',
    [VelgbareFradragskategorier.OffentligPensjon]: 'Offentlig pensjon',
    [VelgbareFradragskategorier.Introduksjonsstønad]: 'Introduksjonsstønad',
    [VelgbareFradragskategorier.Kvalifiseringsstønad]: 'Kvalifiseringsstønad',
    [VelgbareFradragskategorier.PrivatPensjon]: 'Privat pensjon',
    [VelgbareFradragskategorier.Kontantstøtte]: 'Kontantstøtte',
    [VelgbareFradragskategorier.BidragEtterEkteskapsloven]: 'Bidrag etter ekteskapsloven',
    [VelgbareFradragskategorier.Kapitalinntekt]: 'Kapitalinntekt',
    [VelgbareFradragskategorier.Annet]: 'Annet',
};

const ikkeVelgbareFradragskategoriMessages: { [key in IkkeVelgbareFradragskategorier]: string } = {
    [IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold]: 'NAV-ytelser til livsopphold',
    [IkkeVelgbareFradragskategorier.ForventetInntekt]: 'Forventet inntekt etter uførhet',
    [IkkeVelgbareFradragskategorier.BeregnetFradragEPS]: 'Ektefelle/samboer totalt',
    [IkkeVelgbareFradragskategorier.UnderMinstenivå]: 'Beløp under minstegrense for utbetaling',
    [IkkeVelgbareFradragskategorier.AvkortingUtenlandsopphold]: 'Avkorting for utenlandsopphold',
};
export default {
    'display.checkbox.fraUtland': 'Fra utland',
    'display.checkbox.tilhørerEPS': 'Ektefelle/samboer',

    'display.fradrag.type': 'Type',
    'display.fradrag.beløp': 'Beløp per måned',

    'display.input.beløpIUtenlandskValuta': 'Månedsbeløp i utenlandsk valuta',
    'display.input.kurs': 'Kurs ved utregning',
    'display.input.kurs.desimal': 'Skriv desimal med punktum',
    'display.input.valuta': 'Valuta',

    'fradrag.heading': 'Fradrag',

    'fradrag.type.emptyLabel': 'Velg fradragstype',
    'fradrag.input.spesifiserFradrag': 'Spesifiser fradragstypen',

    'fradrag.utenlandsk.beløp': 'Månedsbeløp i utenlandsk valuta',
    'fradrag.utenlandsk.kurs': 'Kurs',

    'fradrag.delerAvPeriode': 'Deler av perioden',
    'fradrag.delerAvPeriode.fom': 'Fra og med',
    'fradrag.delerAvPeriode.tom': 'Til og med',
    'fradrag.delerAvPeriode.utHeleStønadsperioden': 'Ut hele stønadsperioden',

    'fradrag.eps.fribeløp': 'Fribeløp',

    'knapp.fradrag.leggtil': 'Legg til fradrag',
    'knapp.fradrag.leggtil.annet': 'Legg til et annet fradrag',
    'knapp.fradrag.fjern': 'Fjern fradrag',

    ...velgbareFradragskategoriMessages,
    ...ikkeVelgbareFradragskategoriMessages,
    'fradrag.suffix.eps': '(ektefelle/samboer)',
};

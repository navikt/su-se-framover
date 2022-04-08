import { IkkeVelgbareFradragstyper, VelgbareFradragstyper } from '~src/types/Fradrag';

const velgbareFradragstypeMessages: { [key in VelgbareFradragstyper]: string } = {
    [VelgbareFradragstyper.Sosialstønad]: 'Sosialstønad',
    [VelgbareFradragstyper.Uføretrygd]: 'Uføretrygd',
    [VelgbareFradragstyper.Alderspensjon]: 'Alderspensjon',
    [VelgbareFradragstyper.Arbeidsavklaringspenger]: 'Arbeidsavklaringspenger',
    [VelgbareFradragstyper.Dagpenger]: 'Dagpenger',
    [VelgbareFradragstyper.SupplerendeStønad]: 'Supplerende stønad',
    [VelgbareFradragstyper.AvtalefestetPensjon]: 'Avtalefestet pensjon (AFP)',
    [VelgbareFradragstyper.AvtalefestetPensjonPrivat]: 'Avtalefestet pensjon privat (AFP)',
    [VelgbareFradragstyper.Sykepenger]: 'Sykepenger',
    [VelgbareFradragstyper.Gjenlevendepensjon]: 'Gjenlevendepensjon',
    [VelgbareFradragstyper.Arbeidsinntekt]: 'Arbeidsinntekt',
    [VelgbareFradragstyper.OffentligPensjon]: 'Offentlig pensjon',
    [VelgbareFradragstyper.Introduksjonsstønad]: 'Introduksjonsstønad',
    [VelgbareFradragstyper.Kvalifiseringsstønad]: 'Kvalifiseringsstønad',
    [VelgbareFradragstyper.PrivatPensjon]: 'Privat pensjon',
    [VelgbareFradragstyper.Kontantstøtte]: 'Kontantstøtte',
    [VelgbareFradragstyper.BidragEtterEkteskapsloven]: 'Bidrag etter ekteskapsloven',
    [VelgbareFradragstyper.Kapitalinntekt]: 'Kapitalinntekt',
    [VelgbareFradragstyper.Annet]: 'Annet',
};

const ikkeVelgbareFradragstypeMessages: { [key in IkkeVelgbareFradragstyper]: string } = {
    [IkkeVelgbareFradragstyper.NAVytelserTilLivsopphold]: 'NAV-ytelser til livsopphold',
    [IkkeVelgbareFradragstyper.ForventetInntekt]: 'Forventet inntekt etter uførhet',
    [IkkeVelgbareFradragstyper.BeregnetFradragEPS]: 'Ektefelle/samboer totalt',
    [IkkeVelgbareFradragstyper.UnderMinstenivå]: 'Beløp under minstegrense for utbetaling',
    [IkkeVelgbareFradragstyper.AvkortingUtenlandsopphold]: 'Avkorting for utenlandsopphold',
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

    ...velgbareFradragstypeMessages,
    ...ikkeVelgbareFradragstypeMessages,
    'fradrag.suffix.eps': '(ektefelle/samboer)',
};

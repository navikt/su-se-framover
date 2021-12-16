import { Fradragstype } from '~types/Fradrag';

export const fradragstypeMessages: { [key in Fradragstype]: string } = {
    [Fradragstype.NAVytelserTilLivsopphold]: 'NAV-ytelser til livsopphold',
    [Fradragstype.Arbeidsinntekt]: 'Arbeidsinntekt',
    [Fradragstype.OffentligPensjon]: 'Offentlig pensjon',
    [Fradragstype.PrivatPensjon]: 'Privat pensjon',
    [Fradragstype.Sosialstønad]: 'Sosialstønad',
    [Fradragstype.Kontantstøtte]: 'Kontantstøtte',
    [Fradragstype.Introduksjonsstønad]: 'Introduksjonsstønad',
    [Fradragstype.Kvalifiseringsstønad]: 'Kvalifiseringsstønad',
    [Fradragstype.BidragEtterEkteskapsloven]: 'Bidrag etter ekteskapsloven',
    [Fradragstype.Kapitalinntekt]: 'Kapitalinntekt',
    [Fradragstype.ForventetInntekt]: 'Forventet inntekt etter uførhet',
    [Fradragstype.BeregnetFradragEPS]: 'Ektefelle/samboer totalt',
    [Fradragstype.UnderMinstenivå]: 'Beløp under minstegrense for utbetaling',
    [Fradragstype.AvkortingUtenlandsopphold]: 'Avkorting for utenlandsopphold',
};

export default {
    ...fradragstypeMessages,
    'fradrag.suffix.eps': '(ektefelle/samboer)',
};

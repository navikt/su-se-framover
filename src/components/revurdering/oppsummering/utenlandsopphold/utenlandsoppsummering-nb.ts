import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';

export const utenlandsoppholdStatusMessages: { [key in Utenlandsoppholdstatus]: string } = {
    [Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet]: 'Ja',
    [Utenlandsoppholdstatus.SkalHoldeSegINorge]: 'Nei',
    [Utenlandsoppholdstatus.Uavklart]: 'Uavklart',
};

export default {
    'periode.label': 'Gjeldende periode',
    'status.label': 'Skal søkeren oppholde seg mer enn 90 dager i utlandet?',
    'begrunnelse.label': 'Begrunnelse',
};

import { Utenlandsoppholdstatus } from '~types/Revurdering';

const messages: { [key in Utenlandsoppholdstatus]: string } & { [key: string]: string } = {
    'status.label': 'Skal søkeren oppholde seg mer enn 90 dager i utlandet?',
    'begrunnelse.label': 'Begrunnelse',

    SkalVæreMerEnn90DagerIUtlandet: 'Ja',
    SkalHoldeSegINorge: 'Nei',
};

export default messages;

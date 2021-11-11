import { Utenlandsoppholdstatus } from '~types/Revurdering';

export const utenlandsoppholdStatusMessages: { [key in Utenlandsoppholdstatus]: string } = {
    [Utenlandsoppholdstatus.Utenlands]: 'Ja',
    [Utenlandsoppholdstatus.Innenlands]: 'Nei',
};

export default {
    'status.label': 'Skal søkeren oppholde seg mer enn 90 dager i utlandet?',
    'begrunnelse.label': 'Begrunnelse',
};

import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';

export const steg: { [key in KontrollsamtaleSteg]: string } = {
    [KontrollsamtaleSteg.PersonligOppmøte]: 'Personlig Oppmøte',
    [KontrollsamtaleSteg.FullmaktOgLegeerklæring]: 'Fullmakt og legeerklæring',
    [KontrollsamtaleSteg.OriginalPass]: 'Original pass',
    [KontrollsamtaleSteg.ReisetilUtlandet]: 'Reise til utlandet',
    [KontrollsamtaleSteg.ØkonomiskSituasjon]: 'Økonomisk situasjon',
    [KontrollsamtaleSteg.AndreForhold]: 'Andre forhold',
    [KontrollsamtaleSteg.SkatteOpplysninger]: 'Skatteopplysninger',
    [KontrollsamtaleSteg.Oppsummering]: 'Oppsummering',
};

export default {
    'steg.oppsummering.hjelpetekst':
        'Les gjennom oppsummeringen før du sender inn skjemaet. Hvis du trenger å gjøre endringer, kan du gjøre det ved å klikke på lenken under hver del.',
    ...steg,
};

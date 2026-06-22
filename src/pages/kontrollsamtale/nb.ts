import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';

export const steg: { [key in KontrollsamtaleSteg]: string } = {
    [KontrollsamtaleSteg.PersonligOppmøte]: 'Personlig Oppmøte',
    [KontrollsamtaleSteg.FullmaktOgLegeerklæring]: 'Fullmakt og legeerklæring',
    [KontrollsamtaleSteg.OriginalPass]: 'Original pass',
    [KontrollsamtaleSteg.ReisetilUtlandet]: 'Reise til utlandet',
    [KontrollsamtaleSteg.ØkonomiskSituasjon]: 'Økonomisk situasjon',
    [KontrollsamtaleSteg.AndreForhold]: 'Andre forhold',
    [KontrollsamtaleSteg.SkatteOpplysninger]: 'Skatteppplysninger',
};

export default {
    ...steg,
};

import { OmgjøringsGrunn } from '~src/types/Revurdering.ts';

export const omgjøringsgrunnerTekstMapper: { [key in OmgjøringsGrunn]: string } = {
    [OmgjøringsGrunn.NYE_OPPLYSNINGER]: 'Nye opplysninger',
    [OmgjøringsGrunn.FEIL_LOVANVENDELSE]: 'Feil lovanvendelse',
    [OmgjøringsGrunn.FEIL_REGELFORSTÅELSE]: 'Feil regelforståelse',
    [OmgjøringsGrunn.FEIL_FAKTUM]: 'Feil faktum',
};

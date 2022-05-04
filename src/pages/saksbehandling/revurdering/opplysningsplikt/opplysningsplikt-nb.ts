import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';

export const opplysningspliktTesktMapper: { [key in OpplysningspliktBeksrivelse]: string } = {
    [OpplysningspliktBeksrivelse.TilstrekkeligDokumentasjon]: 'Tilstrekkelig dokumentasjon',
    [OpplysningspliktBeksrivelse.UtilstrekkeligDokumentasjon]: 'Utilstrekkelig dokumentasjon',
};

export default {
    'datepicker.fom': 'Fra og med',
    'datepicker.tom': 'Til og med',
    'periode.ny': 'Ny periode',
    'periode.slett': 'Slett',

    'eksisterende.vedtakinfo.tittel': 'Eksisterende vedtaksinformasjon',

    'select.label': 'Beskrivelse',
    'select.defaultValue': 'Velg beskrivelse',

    ...opplysningspliktTesktMapper,
};

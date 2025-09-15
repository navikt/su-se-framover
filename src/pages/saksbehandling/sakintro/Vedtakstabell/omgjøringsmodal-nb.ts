import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { OmgjøringsÅrsak } from '~src/types/Revurdering';

export const opprettOmgjøringÅrsakTekstMapper: { [key in OmgjøringsÅrsak]: string } = {
    [OmgjøringsÅrsak.OMGJØRING_VEDTAK_FRA_KLAGEINSTANSEN]: 'Omgjøring etter vedtak fra klageinstansen',
    [OmgjøringsÅrsak.OMGJØRING_EGET_TILTAK]: 'Omgjøring etter eget tiltak',
    [OmgjøringsÅrsak.OMGJØRING_KLAGE]: 'Omgjøring etter klage i førsteinstans',
    [OmgjøringsÅrsak.OMGJØRING_TRYGDERETTEN]: 'Omgjøring etter vedtak fra trygderetten',
};

export default {
    'input.årsak.label': 'Årsak for omgjøring',
    'input.årsak.value': 'Velg årsak',
    'input.omgjøringsgrunn.label': 'Omgjøringsgrunn',
    'input.omgjøringsgrunn.value': 'Velg en omgjøringsgrunn',
    info: 'Tidligere avslagsbehandling blir kopiert inn i omgjøringsbehandlingen, som dermed får status "vilkårsvurdert" og resultat "avslag". Vurder vilkårene på nytt, og oppdater saken med korrekt resultat.',

    ...opprettOmgjøringÅrsakTekstMapper,
    ...omgjøringsgrunnerTekstMapper,
};

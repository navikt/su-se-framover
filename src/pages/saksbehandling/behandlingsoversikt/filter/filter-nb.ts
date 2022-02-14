import { restansStatus, restansTypeMessages } from '~pages/saksbehandling/restans/restanser-nb';

export default {
    tidsperiode: 'Tidsperiode',
    behandlingstype: 'Behandlingstype',
    behandlingsstatus: 'Behandlingsstatus',
    resultat: 'Resultat',
    tilOgMed: 'Dato til og med',
    fraOgMed: 'Dato fra og med',
    datovalidering: 'Kan ikke være før fra og med dato',
    ...restansTypeMessages,
    ...restansStatus,
};

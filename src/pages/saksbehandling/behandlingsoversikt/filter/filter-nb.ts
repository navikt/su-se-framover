import { restansStatus, restansTypeMessages } from '~pages/saksbehandling/restans/restanser-nb';

export default {
    tidsperiode: 'Tidsperiode',
    behandlingstype: 'Behandlingstype',
    behandlingsstatus: 'Behandlingsstatus',
    resultat: 'Resultat',
    tilOgMed: 'Dato til og med',
    fraOgMed: 'Dato fra og med',
    ...restansTypeMessages,
    ...restansStatus,
};

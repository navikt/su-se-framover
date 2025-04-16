import {
    behandlingssammendragStatus,
    behandlingssammendragTypeMessages,
    sakstypeText,
} from '~src/pages/saksbehandling/behandlingssammendrag/Behandlingssammendrag-nb';

export default {
    tidsperiode: 'Tidsperiode',
    behandlingstype: 'Behandlingstype',
    behandlingsstatus: 'Behandlingsstatus',
    resultat: 'Resultat',
    tilOgMed: 'Dato til og med',
    fraOgMed: 'Dato fra og med',
    datovalidering: 'Kan ikke være før fra og med dato',
    ...behandlingssammendragTypeMessages,
    ...behandlingssammendragStatus,
    ...sakstypeText,
};

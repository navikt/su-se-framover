import {
    BehandlingssammendragMedId,
    BehandlingssammendragStatus,
    BehandlingssammendragType,
} from '~src/types/Behandlingssammendrag';
import { Sakstype } from '~src/types/Sak';
import { BehandlingssammendragKolonne, sortTabell } from './BehandlingssammendragUtils';

const behandlingssammendrag: BehandlingssammendragMedId[] = ['10000', '2020', '10001', '9999'].map(
    (saksnummer, index) => ({
        id: saksnummer,
        sakType: Sakstype.Alder,
        saksnummer,
        typeBehandling: BehandlingssammendragType.SØKNADSBEHANDLING,
        status: BehandlingssammendragStatus.UNDER_BEHANDLING,
        periode: null,
        behandlingStartet: `2026-01-0${index + 1}T12:00:00Z`,
    }),
);

describe('sortTabell', () => {
    it('sorterer 10000 og høyere etter 2020 og 9999 i stigende rekkefølge', () => {
        const resultat = sortTabell(behandlingssammendrag, BehandlingssammendragKolonne.saksnummer, 'ascending');

        expect(resultat.map((rad) => rad.saksnummer)).toEqual(['2020', '9999', '10000', '10001']);
        expect(behandlingssammendrag.map((rad) => rad.saksnummer)).toEqual(['10000', '2020', '10001', '9999']);
    });

    it('sorterer 10000 og høyere før 9999 og 2020 i synkende rekkefølge', () => {
        const resultat = sortTabell(behandlingssammendrag, BehandlingssammendragKolonne.saksnummer, 'descending');

        expect(resultat.map((rad) => rad.saksnummer)).toEqual(['10001', '10000', '9999', '2020']);
    });

    it('sorterer behandlingsstart med eldste først i stigende rekkefølge', () => {
        const resultat = sortTabell(behandlingssammendrag, BehandlingssammendragKolonne.behandlingStartet, 'ascending');

        expect(resultat.map((rad) => rad.id)).toEqual(['10000', '2020', '10001', '9999']);
    });

    it('sorterer behandlingsstart med nyeste først i synkende rekkefølge', () => {
        const resultat = sortTabell(
            behandlingssammendrag,
            BehandlingssammendragKolonne.behandlingStartet,
            'descending',
        );

        expect(resultat.map((rad) => rad.id)).toEqual(['9999', '10001', '2020', '10000']);
    });
});

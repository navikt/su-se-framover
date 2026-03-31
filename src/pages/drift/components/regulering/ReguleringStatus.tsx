import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { hentReguleringsstatusUtestående } from '~src/api/reguleringApi.ts';
import { useApiCall } from '~src/lib/hooks.ts';
import { ReguleringStatusUtestående } from '~src/types/Regulering.ts';
import { Sakstype } from '~src/types/Sak.ts';

const ReguleringStatus = () => {
    const [reguleringsstatusUteståendeStatus, reguleringsstatusUteståendeRequest] = useApiCall(
        hentReguleringsstatusUtestående,
    );
    const [reguleringStatusUtestående, setReguleringStatus] = useState<ReguleringStatusUtestående | null>(null);

    useEffect(() => {
        reguleringsstatusUteståendeRequest({}, (data: ReguleringStatusUtestående) => {
            console.log(data);
            setReguleringStatus(data);
        });
    }, []);

    if (RemoteData.isFailure(reguleringsstatusUteståendeStatus)) {
        return <div>Noe gikk galt..</div>;
    }

    if (reguleringStatusUtestående == null || RemoteData.isPending(reguleringsstatusUteståendeStatus)) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Heading size={'medium'}>Regulering status</Heading>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>Siste grunnbeløp og satser</Heading>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 0.5rem' }}>
                    <dt style={{ fontWeight: 'bold' }}>Grunnbeløp</dt>
                    <dd>{reguleringStatusUtestående.sisteGrunnbeløpOgSatser.grunnbeløp}</dd>
                    <dt style={{ fontWeight: 'bold' }}>Garantipensjon ordinær</dt>
                    <dd>{reguleringStatusUtestående.sisteGrunnbeløpOgSatser.garantipensjonOrdinær}</dd>
                    <dt style={{ fontWeight: 'bold' }}>Garantipensjon høy</dt>
                    <dd>{reguleringStatusUtestående.sisteGrunnbeløpOgSatser.garantipensjonHøy}</dd>
                </dl>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>Saker med utebetaling i mai</Heading>
                <p>{reguleringStatusUtestående.sakerMedUtebetalingIMai}</p>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>
                    Saker med gammelt grunnbeløp ({reguleringStatusUtestående.sakerMedGammelG.length})
                </Heading>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Saksnummer</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Type</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Benyttet grunnbeløp</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Sats</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Satskategori</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reguleringStatusUtestående.sakerMedGammelG.map((sak) => (
                            <tr key={sak.saksnummer}>
                                <td>{sak.saksnummer}</td>
                                <td>{sak.type}</td>
                                <td>{sak.benyttetGrunnbeløp ?? '—'}</td>
                                <td>{sak.benyttetSats}</td>
                                <td>{sak.benyttetSatskategori}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default ReguleringStatus;

export const mockReguleringStatus = (): ReguleringStatusUtestående => ({
    sisteGrunnbeløpOgSatser: {
        grunnbeløp: 118620,
        garantipensjonOrdinær: 187080,
        garantipensjonHøy: 193590,
    },
    sakerMedUtebetalingIMai: 100,
    sakerMedGammelG: [
        {
            saksnummer: 1,
            type: Sakstype.Uføre,
            benyttetGrunnbeløp: 106399,
            benyttetSatskategori: 'ordinær',
            benyttetSats: 2.48,
        },
        {
            saksnummer: 2,
            type: Sakstype.Alder,
            benyttetGrunnbeløp: null,
            benyttetSatskategori: 'høy',
            benyttetSats: 2.91,
        },
        {
            saksnummer: 3,
            type: Sakstype.Uføre,
            benyttetGrunnbeløp: 111477,
            benyttetSatskategori: 'ordinær',
            benyttetSats: 2.48,
        },
        {
            saksnummer: 4,
            type: Sakstype.Alder,
            benyttetGrunnbeløp: null,
            benyttetSatskategori: 'ordinær',
            benyttetSats: 2.48,
        },
        {
            saksnummer: 5,
            type: Sakstype.Uføre,
            benyttetGrunnbeløp: 99858,
            benyttetSatskategori: 'høy',
            benyttetSats: 2.91,
        },
    ],
});

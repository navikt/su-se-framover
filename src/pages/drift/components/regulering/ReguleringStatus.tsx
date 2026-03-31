import { Heading } from '@navikt/ds-react';
import { Sakstype } from '~src/types/Sak.ts';

const ReguleringStatus = () => {
    const data = mockReguleringStatus();

    return (
        <div>
            <Heading size={'medium'}>Regulering status</Heading>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>Siste grunnbeløp og satser</Heading>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 0.5rem' }}>
                    <dt style={{ fontWeight: 'bold' }}>Grunnbeløp</dt>
                    <dd>{data.sisteGrunnbeløpOgSatser.grunnbeløp}</dd>
                    <dt style={{ fontWeight: 'bold' }}>Garantipensjon ordinær</dt>
                    <dd>{data.sisteGrunnbeløpOgSatser.garantipensjonOrdinær}</dd>
                    <dt style={{ fontWeight: 'bold' }}>Garantipensjon høy</dt>
                    <dd>{data.sisteGrunnbeløpOgSatser.garantipensjonHøy}</dd>
                </dl>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>Saker med utebetaling i mai</Heading>
                <p>{data.sakerMedUtebetalingIMai}</p>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <Heading size={'xsmall'}>Saker med gammelt grunnbeløp ({data.sakerMedGammelG.length})</Heading>
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
                        {data.sakerMedGammelG.map((sak) => (
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

interface ReguleringStatus {
    sisteGrunnbeløpOgSatser: SisteGrunnbeløpOgSatser;
    sakerMedUtebetalingIMai: number;
    sakerMedGammelG: SakMedGammeltGrunnbeløp[];
}

interface SakMedGammeltGrunnbeløp {
    saksnummer: number;
    type: Sakstype;
    benyttetGrunnbeløp: number | null; // Kun uføre
    benyttetSatskategori: string;
    benyttetSats: number;
}

interface SisteGrunnbeløpOgSatser {
    grunnbeløp: number;
    garantipensjonOrdinær: number;
    garantipensjonHøy: number;
}

export const mockReguleringStatus = (): ReguleringStatus => ({
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

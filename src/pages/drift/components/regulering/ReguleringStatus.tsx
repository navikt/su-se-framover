import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Loader, Table } from '@navikt/ds-react';
import { useEffect } from 'react';
import { hentReguleringsstatusUtestående } from '~src/api/reguleringApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { useApiCall } from '~src/lib/hooks.ts';

const ReguleringStatus = () => {
    const [reguleringsstatusUtestående, reguleringsstatusUteståendeRequest] = useApiCall(
        hentReguleringsstatusUtestående,
    );

    useEffect(() => {
        reguleringsstatusUteståendeRequest({});
    }, []);

    return (
        <>
            {RemoteData.isFailure(reguleringsstatusUtestående) && (
                <ApiErrorAlert error={reguleringsstatusUtestående.error} />
            )}
            {RemoteData.isPending(reguleringsstatusUtestående) && <Loader />}
            {RemoteData.isSuccess(reguleringsstatusUtestående) && (
                <div>
                    <Heading size={'medium'}>Regulering status</Heading>

                    <section style={{ marginTop: '2rem' }}>
                        <Heading size={'small'}>Siste grunnbeløp og satser</Heading>
                        <Table>
                            <Table.Body>
                                <Table.Row>
                                    <Table.HeaderCell scope="row">Grunnbeløp</Table.HeaderCell>
                                    <Table.DataCell>
                                        {reguleringsstatusUtestående.value.sisteGrunnbeløpOgSatser.grunnbeløp}
                                    </Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeaderCell scope="row">Garantipensjon ordinær</Table.HeaderCell>
                                    <Table.DataCell>
                                        {
                                            reguleringsstatusUtestående.value.sisteGrunnbeløpOgSatser
                                                .garantipensjonOrdinær
                                        }
                                    </Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeaderCell scope="row">Garantipensjon høy</Table.HeaderCell>
                                    <Table.DataCell>
                                        {reguleringsstatusUtestående.value.sisteGrunnbeløpOgSatser.garantipensjonHøy}
                                    </Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </section>

                    <section style={{ marginTop: '2rem' }}>
                        <Heading size={'small'}>
                            Saker med utebetaling i mai ({reguleringsstatusUtestående.value.sakerMedUtebetalingIMai})
                        </Heading>
                        <Heading size={'small'}>
                            Saker med gammelt grunnbeløp ({reguleringsstatusUtestående.value.sakerMedGammelG.length})
                        </Heading>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Saksnummer</Table.HeaderCell>
                                    <Table.HeaderCell>Type</Table.HeaderCell>
                                    <Table.HeaderCell>Benyttet grunnbeløp</Table.HeaderCell>
                                    <Table.HeaderCell>Sats</Table.HeaderCell>
                                    <Table.HeaderCell>Satskategori</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {reguleringsstatusUtestående.value.sakerMedGammelG.map((sak) => (
                                    <Table.Row key={sak.saksnummer}>
                                        <Table.DataCell>{sak.saksnummer}</Table.DataCell>
                                        <Table.DataCell>{sak.type}</Table.DataCell>
                                        <Table.DataCell>{sak.benyttetGrunnbeløp ?? '—'}</Table.DataCell>
                                        <Table.DataCell>{sak.benyttetSats}</Table.DataCell>
                                        <Table.DataCell>{sak.benyttetSatskategori}</Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </section>
                </div>
            )}
        </>
    );
};

export default ReguleringStatus;

import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Loader, Select, Table } from '@navikt/ds-react';
import { useState } from 'react';
import { hentReguleringsstatusUtestående } from '~src/api/reguleringApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { useApiCall } from '~src/lib/hooks.ts';

const ReguleringStatus = () => {
    const [reguleringsstatusUtestående, reguleringsstatusUteståendeRequest] = useApiCall(
        hentReguleringsstatusUtestående,
    );
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const [valgtÅr, setValgtÅr] = useState<string>(currentYear.toString());

    return (
        <>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <Select label="År" value={valgtÅr} onChange={(event) => setValgtÅr(event.target.value)}>
                    <option value={currentYear.toString()}>{currentYear}</option>
                    <option value={previousYear.toString()}>{previousYear}</option>
                </Select>
                <Button onClick={() => reguleringsstatusUteståendeRequest({ år: Number(valgtÅr) })}>
                    Hent utestående reguleringer
                </Button>
            </div>
            {RemoteData.isFailure(reguleringsstatusUtestående) && (
                <ApiErrorAlert error={reguleringsstatusUtestående.error} />
            )}
            {RemoteData.isPending(reguleringsstatusUtestående) && <Loader />}
            {RemoteData.isSuccess(reguleringsstatusUtestående) && (
                <div>
                    <Heading size={'medium'}>Regulering status {reguleringsstatusUtestående.value.aar}</Heading>

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

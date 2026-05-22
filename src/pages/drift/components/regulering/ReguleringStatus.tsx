import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, HelpText, Loader, Select, Table } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { hentReguleringsstatusUtestående, produserReguleringsstatusUtestående } from '~src/api/reguleringApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { useApiCall } from '~src/lib/hooks.ts';

const ReguleringStatus = () => {
    const [reguleringsstatusUtestående, reguleringsstatusUteståendeRequest] = useApiCall(
        hentReguleringsstatusUtestående,
    );
    const [produserReguleringsstatusUteståendeStatus, produserReguleringsstatusUteståendeRequest] = useApiCall(
        produserReguleringsstatusUtestående,
    );
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const [valgtÅr, setValgtÅr] = useState<string>(currentYear.toString());

    useEffect(() => {
        reguleringsstatusUteståendeRequest({});
    }, []);

    return (
        <>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <Select label="År" value={valgtÅr} onChange={(event) => setValgtÅr(event.target.value)}>
                    <option value={currentYear.toString()}>{currentYear}</option>
                    <option value={previousYear.toString()}>{previousYear}</option>
                </Select>
                <Button onClick={() => produserReguleringsstatusUteståendeRequest({ år: Number(valgtÅr) })}>
                    Hent utestående reguleringer
                </Button>
            </div>
            <div style={{ marginTop: '2rem' }}>
                {RemoteData.isPending(produserReguleringsstatusUteståendeStatus) && <Loader />}
                {RemoteData.isSuccess(produserReguleringsstatusUteståendeStatus) && (
                    <Alert variant="success">
                        Produksjon av reguleringsstatus er oppstartet. Det kan ta noen minutter og krever refresh av
                        side.
                    </Alert>
                )}
                {RemoteData.isFailure(produserReguleringsstatusUteståendeStatus) && (
                    <ApiErrorAlert error={produserReguleringsstatusUteståendeStatus.error} />
                )}
            </div>
            {RemoteData.isFailure(reguleringsstatusUtestående) && (
                <ApiErrorAlert error={reguleringsstatusUtestående.error} />
            )}
            {RemoteData.isPending(reguleringsstatusUtestående) && <Loader />}
            {RemoteData.isSuccess(reguleringsstatusUtestående) &&
                reguleringsstatusUtestående.value.map((status) => (
                    <div
                        key={status.id}
                        style={{ marginTop: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #c6c2bf' }}
                    >
                        {status.reguleringStatus && (
                            <div>
                                <Alert variant={status.produserStatus === 'Fullført' ? 'success' : 'error'}>
                                    Regulering status {status.reguleringStatus.aar}
                                </Alert>
                                <section style={{ marginTop: '2rem' }}>
                                    <Heading size={'small'}>Siste grunnbeløp og satser</Heading>
                                    <Table>
                                        <Table.Body>
                                            <Table.Row>
                                                <Table.HeaderCell scope="row">Grunnbeløp</Table.HeaderCell>
                                                <Table.DataCell>
                                                    {status.reguleringStatus.sisteGrunnbeløpOgSatser.grunnbeløp}
                                                </Table.DataCell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.HeaderCell scope="row">Garantipensjon ordinær</Table.HeaderCell>
                                                <Table.DataCell>
                                                    {
                                                        status.reguleringStatus.sisteGrunnbeløpOgSatser
                                                            .garantipensjonOrdinærMåned
                                                    }
                                                </Table.DataCell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.HeaderCell scope="row">Garantipensjon høy</Table.HeaderCell>
                                                <Table.DataCell>
                                                    {
                                                        status.reguleringStatus.sisteGrunnbeløpOgSatser
                                                            .garantipensjonHøyMåned
                                                    }
                                                </Table.DataCell>
                                            </Table.Row>
                                        </Table.Body>
                                    </Table>
                                </section>

                                <section style={{ marginTop: '2rem' }}>
                                    <Heading size={'small'}>
                                        Saker med utebetaling i mai ({status.reguleringStatus.sakerMedUtebetalingIMai})
                                    </Heading>
                                    <Heading size={'small'}>
                                        Saker med gammelt grunnbeløp ({status.reguleringStatus.sakerMedGammelG.length})
                                    </Heading>
                                    <Table>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Saksnummer</Table.HeaderCell>
                                                <Table.HeaderCell>Type</Table.HeaderCell>
                                                <Table.HeaderCell>Benyttet grunnbeløp</Table.HeaderCell>
                                                <Table.HeaderCell>Sats</Table.HeaderCell>
                                                <Table.HeaderCell>Satskategori</Table.HeaderCell>
                                                <Table.HeaderCell>Fra og med mai</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {status.reguleringStatus.sakerMedGammelG.map((sak) => (
                                                <Table.Row key={sak.saksnummer}>
                                                    <Table.DataCell>{sak.saksnummer}</Table.DataCell>
                                                    <Table.DataCell>{sak.type}</Table.DataCell>
                                                    <Table.DataCell>{sak.benyttetGrunnbeløp ?? '—'}</Table.DataCell>
                                                    <Table.DataCell>{sak.benyttetSats}</Table.DataCell>
                                                    <Table.DataCell>{sak.benyttetSatskategori}</Table.DataCell>
                                                    <Table.DataCell>
                                                        {sak.vedtakFomSenereEnnMai ? (
                                                            'Ja'
                                                        ) : (
                                                            <Alert variant="warning">
                                                                Nei{' '}
                                                                <HelpText>
                                                                    Sjekket vedtak var ikke fom mai og bør sjekke fra og
                                                                    med mai manuelt
                                                                </HelpText>
                                                            </Alert>
                                                        )}
                                                    </Table.DataCell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </section>
                            </div>
                        )}
                    </div>
                ))}
        </>
    );
};

export default ReguleringStatus;

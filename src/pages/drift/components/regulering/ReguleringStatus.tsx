import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Select, Table, Textarea } from '@navikt/ds-react';
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
                reguleringsstatusUtestående.value.map((status) => {
                    const statusAlert =
                        status.produserStatus === 'Feilet'
                            ? 'error'
                            : status.produserStatus === 'Fullført'
                              ? 'success'
                              : 'warning';

                    const utenÅpenRegulering = status.reguleringStatus
                        ? status.reguleringStatus.utenÅpenRegulering.map((it) => it.saksnummer).join(', ')
                        : '';

                    return (
                        <div
                            key={status.id}
                            style={{ marginTop: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #c6c2bf' }}
                        >
                            <Alert variant={statusAlert}>Uthenting av status {status.produserStatus}</Alert>
                            {status.reguleringStatus && (
                                <div>
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
                                                    <Table.HeaderCell scope="row">
                                                        Garantipensjon ordinær
                                                    </Table.HeaderCell>
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
                                            Saker med utebetaling i mai (
                                            {status.reguleringStatus.sakerMedUtebetalingIMai})
                                        </Heading>
                                        <Heading size={'small'}>
                                            Saker med gammelt grunnbeløp ({status.reguleringStatus.sakerMedGammelG})
                                        </Heading>
                                        <Heading size={'small'}>
                                            Uten åpen manuell behandling (
                                            {status.reguleringStatus.utenÅpenRegulering.length})
                                        </Heading>
                                        {status.reguleringStatus.utenÅpenRegulering.length > 0 && (
                                            <Textarea resize readOnly label="saksnummer">
                                                {utenÅpenRegulering}
                                            </Textarea>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                    );
                })}
        </>
    );
};

export default ReguleringStatus;

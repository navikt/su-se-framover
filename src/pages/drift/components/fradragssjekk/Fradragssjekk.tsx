import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Checkbox, Heading, Loader, Modal, Table, Tag } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import {
    FradragssjekkDriftResultat,
    FradragssjekkSakStatus,
    hentSisteFradragssjekkResultat,
    kjørFradragssjekk,
} from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { formatDate, formatDateTime, toIsoMonth } from '~src/utils/date/dateUtils';

import styles from './Fradragssjekk.module.less';

const sakStatusTekst: Record<FradragssjekkSakStatus, string> = {
    INGEN_AVVIK: 'Ingen avvik',
    KUN_OBSERVASJON: 'Kun observasjon',
    EKSTERN_FEIL: 'Ekstern feil',
    OPPGAVE_IKKE_OPPRETTET_DRY_RUN: 'Oppgave ikke opprettet (dry run)',
    OPPGAVE_OPPRETTET: 'Oppgave opprettet',
    OPPGAVEOPPRETTELSE_FEILET: 'Oppgaveopprettelse feilet',
    INVARIANTBRUDD: 'Invariantbrudd',
};

const Fradragssjekk = () => {
    const [visFradragssjekkModal, setVisFradragssjekkModal] = useState(false);

    return (
        <div>
            <Button variant="secondary" type="button" onClick={() => setVisFradragssjekkModal(true)}>
                Fradragssjekk
            </Button>
            {visFradragssjekkModal && (
                <FradragssjekkModal visModal={visFradragssjekkModal} onClose={() => setVisFradragssjekkModal(false)} />
            )}
        </div>
    );
};

const FradragssjekkModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [maaned, setMaaned] = useState<Nullable<Date>>(null);
    const [dryRun, setDryRun] = useState(false);
    const [fradragssjekkStatus, startFradragssjekk, resetFradragssjekkStatus] = useApiCall(kjørFradragssjekk);
    const [resultatStatus, hentResultat] = useApiCall(hentSisteFradragssjekkResultat);

    useEffect(() => {
        hentResultat(undefined);
    }, [hentResultat]);

    const handleSubmit = () => {
        if (!maaned) {
            return;
        }

        startFradragssjekk({
            maaned: toIsoMonth(maaned),
            dryRun,
        });
    };

    const handleClose = () => {
        resetFradragssjekkStatus();
        setMaaned(null);
        setDryRun(false);
        props.onClose();
    };

    const renderStatus = () => {
        if (RemoteData.isSuccess(fradragssjekkStatus)) {
            return <Alert variant="success">Kjøring startet.</Alert>;
        }

        if (RemoteData.isFailure(fradragssjekkStatus)) {
            if (fradragssjekkStatus.error.statusCode === 409) {
                return <Alert variant="warning">Ordinær kjøring finnes allerede for denne måneden.</Alert>;
            }

            if (fradragssjekkStatus.error.statusCode === 400) {
                return <Alert variant="error">Ugyldig måned.</Alert>;
            }

            return <ApiErrorAlert error={fradragssjekkStatus.error} />;
        }

        return null;
    };

    return (
        <Modal
            className={styles.modal}
            open={props.visModal}
            onClose={handleClose}
            header={{ heading: 'Fradragssjekk' }}
        >
            <Modal.Body>
                <div className={styles.innhold}>
                    <section className={styles.startSeksjon}>
                        <Heading size="small" level="2">
                            Start ny kjøring
                        </Heading>
                        <div className={styles.form}>
                            <MonthPicker label="Måned" value={maaned} onChange={setMaaned} />
                            <Checkbox checked={dryRun} onChange={() => setDryRun(!dryRun)}>
                                Dry run
                            </Checkbox>
                            {renderStatus()}
                            <div className={styles.actions}>
                                <Button
                                    onClick={handleSubmit}
                                    loading={RemoteData.isPending(fradragssjekkStatus)}
                                    disabled={!maaned}
                                >
                                    Start kjøring
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className={styles.resultatSeksjon}>
                        <div className={styles.resultatHeader}>
                            <Heading size="small" level="2">
                                Siste resultat
                            </Heading>
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => hentResultat(undefined)}
                                loading={RemoteData.isPending(resultatStatus)}
                            >
                                <ArrowsCirclepathIcon aria-hidden />
                                Oppdater
                            </Button>
                        </div>
                        <Resultat status={resultatStatus} />
                    </section>
                </div>
            </Modal.Body>
        </Modal>
    );
};

const Resultat = (props: { status: ApiResult<FradragssjekkDriftResultat> }) => {
    if (RemoteData.isInitial(props.status) || RemoteData.isPending(props.status)) {
        return <Loader title="Henter siste resultat" />;
    }

    if (RemoteData.isFailure(props.status)) {
        if (props.status.error.statusCode === 404) {
            return <Alert variant="info">Ingen fradragssjekkjøringer er registrert ennå.</Alert>;
        }
        return <ApiErrorAlert error={props.status.error} />;
    }

    const resultat = props.status.value;

    return (
        <div className={styles.resultat}>
            <div className={styles.metadata}>
                <div>
                    <BodyShort size="small" weight="semibold">
                        Status
                    </BodyShort>
                    <Tag variant={resultat.status === 'FULLFØRT' ? 'success' : 'error'} size="small">
                        {resultat.status === 'FULLFØRT' ? 'Fullført' : 'Feilet'}
                    </Tag>
                </div>
                <Metadata label="Måned" verdi={formatDate(resultat.dato)} />
                <Metadata label="Kjøring" verdi={resultat.dryRun ? 'Dry run' : 'Ordinær'} />
                <Metadata label="Startet" verdi={formatDateTime(resultat.opprettet)} />
                <Metadata label="Ferdigstilt" verdi={formatDateTime(resultat.ferdigstilt)} />
            </div>

            {resultat.status === 'FEILET' && (
                <Alert variant="error">
                    {resultat.feilmelding ?? 'Kjøringen feilet uten at en feilmelding ble registrert.'}
                </Alert>
            )}

            <Oppsummering resultat={resultat} />
            <OpprettedeOppgaver resultat={resultat} />
        </div>
    );
};

const Metadata = (props: { label: string; verdi: string }) => (
    <div>
        <BodyShort size="small" weight="semibold">
            {props.label}
        </BodyShort>
        <BodyShort>{props.verdi}</BodyShort>
    </div>
);

const Oppsummering = (props: { resultat: FradragssjekkDriftResultat }) => {
    const { oppsummering } = props.resultat;
    const nøkkeltall = Object.entries(oppsummering.nøkkeltall) as [FradragssjekkSakStatus, number][];

    return (
        <section className={styles.blokk}>
            <Heading size="xsmall" level="3">
                Oppsummering
            </Heading>
            <BodyShort>
                Antall oppgaver: <strong>{oppsummering.antallOppgaver.toLocaleString('nb-NO')}</strong>
            </BodyShort>
            {nøkkeltall.length > 0 && (
                <Table size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Resultat for sak</Table.HeaderCell>
                            <Table.HeaderCell align="right">Antall</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {nøkkeltall.map(([status, antall]) => (
                            <Table.Row key={status}>
                                <Table.DataCell>{sakStatusTekst[status]}</Table.DataCell>
                                <Table.DataCell align="right">{antall.toLocaleString('nb-NO')}</Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}

            {oppsummering.oppgaverPerSakstype.map((sakstype) => (
                <div className={styles.sakstype} key={sakstype.sakstype}>
                    <Heading size="xsmall" level="4">
                        {sakstype.sakstype === 'ALDER' ? 'Alder' : 'Uføre'} ({sakstype.antallOppgaver})
                    </Heading>
                    {sakstype.oppgaverPerFradrag.length === 0 ? (
                        <BodyShort>Ingen oppgaver fordelt på fradrag.</BodyShort>
                    ) : (
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Fradragstype</Table.HeaderCell>
                                    <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                                    <Table.HeaderCell align="right">Antall oppgaver</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {sakstype.oppgaverPerFradrag.map((fradrag) => (
                                    <Table.Row key={`${fradrag.fradragstype}-${fradrag.beskrivelse ?? ''}`}>
                                        <Table.DataCell>{fradrag.fradragstype}</Table.DataCell>
                                        <Table.DataCell>{fradrag.beskrivelse ?? '–'}</Table.DataCell>
                                        <Table.DataCell align="right">
                                            {fradrag.antallOppgaver.toLocaleString('nb-NO')}
                                        </Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </div>
            ))}
        </section>
    );
};

const OpprettedeOppgaver = (props: { resultat: FradragssjekkDriftResultat }) => (
    <section className={styles.blokk}>
        <Heading size="xsmall" level="3">
            Opprettede oppgaver ({props.resultat.opprettedeOppgaver.length})
        </Heading>
        {props.resultat.opprettedeOppgaver.length === 0 ? (
            <BodyShort>Ingen oppgaver ble opprettet i denne kjøringen.</BodyShort>
        ) : (
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Saksnummer</Table.HeaderCell>
                        <Table.HeaderCell>Oppgave-ID</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.resultat.opprettedeOppgaver.map((oppgave) => (
                        <Table.Row key={oppgave.oppgaveId}>
                            <Table.DataCell>{oppgave.saksnummer}</Table.DataCell>
                            <Table.DataCell>{oppgave.oppgaveId}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        )}
    </section>
);

export default Fradragssjekk;

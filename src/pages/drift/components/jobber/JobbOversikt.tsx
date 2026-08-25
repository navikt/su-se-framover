import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Table, Tag } from '@navikt/ds-react';
import { useEffect } from 'react';

import { fetchJobberStatus, JobbStatus } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';

import styles from './JobbOversikt.module.less';

const statusPrioritet: Record<JobbStatus['status'], number> = {
    FEILET: 0,
    KJØRER: 1,
    FULLFØRT: 2,
};

const statusTagVariant = (status: JobbStatus['status']): 'success' | 'error' | 'info' => {
    switch (status) {
        case 'FULLFØRT':
            return 'success';
        case 'FEILET':
            return 'error';
        case 'KJØRER':
            return 'info';
    }
};

const formaterTidspunkt = (iso: string | null): string => {
    if (!iso) return '–';
    return new Date(iso).toLocaleString('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const beregNestKjøring = (startetTidspunkt: string, intervallSekunder: number): string => {
    if (intervallSekunder <= 0) return '–';
    const neste = new Date(new Date(startetTidspunkt).getTime() + intervallSekunder * 1000);
    return formaterTidspunkt(neste.toISOString());
};

const sorterJobber = (jobber: JobbStatus[]): JobbStatus[] =>
    [...jobber].sort((a, b) => statusPrioritet[a.status] - statusPrioritet[b.status]);

const TrunkertFeilmelding = ({ melding }: { melding: string | null }) => {
    if (!melding) return <>–</>;
    return <span className={styles.feilmelding}>{melding}</span>;
};

const JobbOversikt = () => {
    const [jobberStatus, hentJobber] = useApiCall(fetchJobberStatus);

    useEffect(() => {
        hentJobber();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Heading size="medium">Jobber</Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => hentJobber()}
                    loading={RemoteData.isPending(jobberStatus)}
                >
                    Oppdater
                </Button>
            </div>

            {RemoteData.isPending(jobberStatus) && <Loader size="medium" />}
            {RemoteData.isFailure(jobberStatus) && <ApiErrorAlert error={jobberStatus.error} />}

            {RemoteData.isSuccess(jobberStatus) && jobberStatus.value.length === 0 && (
                <Alert variant="info">Ingen jobber registrert ennå – de dukker opp etter første kjøring</Alert>
            )}

            {RemoteData.isSuccess(jobberStatus) && jobberStatus.value.length > 0 && (
                <Table className={styles.tabell} size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell />
                            <Table.HeaderCell>Jobb</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Startet</Table.HeaderCell>
                            <Table.HeaderCell>Ferdig</Table.HeaderCell>
                            <Table.HeaderCell>Intervall</Table.HeaderCell>
                            <Table.HeaderCell>Neste kjøring</Table.HeaderCell>
                            <Table.HeaderCell>Feilmelding</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sorterJobber(jobberStatus.value).map((jobb) => (
                            <Table.ExpandableRow
                                key={jobb.id}
                                content={
                                    <div className={styles.beskrivelse}>
                                        {jobb.beskrivelse ?? 'Ingen beskrivelse tilgjengelig'}
                                    </div>
                                }
                            >
                                <Table.DataCell>{jobb.jobbNavn}</Table.DataCell>
                                <Table.DataCell>
                                    <Tag variant={statusTagVariant(jobb.status)} size="small">
                                        {jobb.status}
                                    </Tag>
                                </Table.DataCell>
                                <Table.DataCell>{formaterTidspunkt(jobb.startetTidspunkt)}</Table.DataCell>
                                <Table.DataCell>{formaterTidspunkt(jobb.ferdigTidspunkt)}</Table.DataCell>
                                <Table.DataCell>{jobb.intervallSekunder}s</Table.DataCell>
                                <Table.DataCell>
                                    {beregNestKjøring(jobb.startetTidspunkt, jobb.intervallSekunder)}
                                </Table.DataCell>
                                <Table.DataCell>
                                    <TrunkertFeilmelding melding={jobb.feilmelding} />
                                </Table.DataCell>
                            </Table.ExpandableRow>
                        ))}
                    </Table.Body>
                </Table>
            )}
        </div>
    );
};

export default JobbOversikt;

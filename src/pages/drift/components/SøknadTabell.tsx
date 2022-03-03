import { Table } from '@navikt/ds-react';
import React from 'react';

import { SøknadResponse } from '~api/driftApi';

import styles from '../index.module.less';

const Rad = (props: {
    type: 'Journalpost' | 'Oppgave' | 'Brevbestilling';
    status: 'OK' | 'FEIL';
    sakId: string;
    id: string;
    søknadId?: string;
    behandlingId?: string;
}) => {
    return (
        <Table.Row>
            <Table.DataCell>{props.type}</Table.DataCell>
            <Table.DataCell>{props.status}</Table.DataCell>
            <Table.DataCell className={styles.tabelldata}>{props.sakId}</Table.DataCell>
            <Table.DataCell className={styles.tabelldata}>{props.id}</Table.DataCell>
            <Table.DataCell className={styles.tabelldata}>{props.søknadId ?? props.behandlingId}</Table.DataCell>
        </Table.Row>
    );
};

export const SøknadTabellDrift = (props: { søknadResponse: SøknadResponse }) => {
    return (
        <Table className="tabell">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Sakid</Table.HeaderCell>
                    <Table.HeaderCell>Id</Table.HeaderCell>
                    <Table.HeaderCell>Søknadid</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.søknadResponse.journalposteringer.ok.map((journalpost) => (
                    <Rad
                        key={journalpost.journalpostId}
                        type="Journalpost"
                        status="OK"
                        sakId={journalpost.sakId}
                        søknadId={journalpost.søknadId}
                        id={journalpost.journalpostId}
                    />
                ))}
                {props.søknadResponse.journalposteringer.feilet.map((journalpost, index) => (
                    <Rad
                        key={index}
                        type="Journalpost"
                        status="FEIL"
                        sakId={journalpost.sakId}
                        søknadId={journalpost.søknadId}
                        id={journalpost.grunn}
                    />
                ))}
                {props.søknadResponse.oppgaver.ok.map((oppgave) => (
                    <Rad
                        key={oppgave.oppgaveId}
                        type="Oppgave"
                        status="OK"
                        sakId={oppgave.sakId}
                        søknadId={oppgave.søknadId}
                        id={oppgave.oppgaveId}
                    />
                ))}
                {props.søknadResponse.oppgaver.feilet.map((oppgave, index) => (
                    <Rad
                        key={index}
                        type="Oppgave"
                        status="FEIL"
                        sakId={oppgave.sakId}
                        søknadId={oppgave.søknadId}
                        id={oppgave.grunn}
                    />
                ))}
            </Table.Body>
        </Table>
    );
};

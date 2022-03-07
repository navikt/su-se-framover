import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, GuidePanel, Heading, Loader, Table } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { testRegulering } from '~api/reguleringApi';
import * as reguleringApi from '~api/reguleringApi';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';

import styles from '../index.module.less';

const StartGRegulering = () => {
    const [reguleringsstatus, reguler] = useApiCall(testRegulering);
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useApiCall(reguleringApi.hentSakerMedÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger({});
    }, []);

    return (
        <div className={styles.regulering}>
            <Heading level="1" size="medium" className={styles.reguleringHeader}>
                Start G-regulering
            </Heading>
            <GuidePanel className={styles.guidePanel}>
                <p>Nytt grunnbeløp på xxxx kr fra 01.05.22</p>
                <br />
                {pipe(
                    hentÅpneBehandlingerStatus,
                    RemoteData.fold(
                        () => <Loader />,
                        () => <Loader />,
                        () => <Alert variant="error">En feil skjedde under henting av åpne behandlinger</Alert>,
                        (saksnummer) => {
                            return (
                                <>
                                    <p>Antal saker med en behandling til attestering: {saksnummer.length}</p>
                                    <Table size="small" className={styles.saksliste}>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell scope="col">Saksnummer</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {saksnummer.map((s) => (
                                                <Table.Row key={s}>
                                                    <Table.HeaderCell scope="row">{s}</Table.HeaderCell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </>
                            );
                        }
                    )
                )}
            </GuidePanel>

            <Button onClick={() => reguler({})} loading={RemoteData.isPending(reguleringsstatus)}>
                Start G-regulering
            </Button>
            {RemoteData.isSuccess(reguleringsstatus) && <Alert variant="success">G-regulering gjennomført</Alert>}
        </div>
    );
};

export default StartGRegulering;

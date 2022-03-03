import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, GuidePanel, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { testRegulering } from '~api/reguleringApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator } from '~lib/hooks';

import styles from '../index.module.less';

const StartGRegulering = () => {
    const [reguleringsstatus, reguler] = useApiCall(testRegulering);
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger();
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
                        (åpneBehandlinger) => {
                            return <p>Antal åpne behandlinger: {åpneBehandlinger.length}</p>;
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

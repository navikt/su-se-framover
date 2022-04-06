import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, GuidePanel, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import { startRegulering } from '~src/api/reguleringApi';
import * as reguleringApi from '~src/api/reguleringApi';
import DatePicker from '~src/components/datePicker/DatePicker';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import * as styles from '../index.module.less';

const StartGRegulering = () => {
    const [reguleringsstatus, reguler] = useApiCall(startRegulering);
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useApiCall(reguleringApi.hentSakerMedÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger({});
    }, []);

    const [startDato, setStartDato] = useState<Nullable<Date>>(null);

    return (
        <div className={styles.regulering}>
            <Heading level="1" size="medium" className={styles.reguleringHeader}>
                Start G-regulering
            </Heading>
            <GuidePanel className={styles.guidePanel}>
                {pipe(
                    hentÅpneBehandlingerStatus,
                    RemoteData.fold(
                        () => <Loader />,
                        () => <Loader />,
                        () => <Alert variant="error">En feil skjedde under henting av åpne behandlinger</Alert>,
                        (saksnummer) => {
                            return (
                                <>
                                    <p>Antall saker med åpen behandling eller stans: {saksnummer.length}</p>
                                    <br />
                                    <p>{saksnummer.sort().join(', ')}</p>
                                </>
                            );
                        }
                    )
                )}
            </GuidePanel>

            <DatePicker
                label="Velg reguleringsdato"
                value={startDato}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                onChange={(dato) => setStartDato(dato)}
            />

            <Button
                onClick={() => reguler({ startDato: toStringDateOrNull(startDato) ?? '' })}
                loading={RemoteData.isPending(reguleringsstatus)}
            >
                Start regulering
            </Button>
            {RemoteData.isSuccess(reguleringsstatus) && <Alert variant="success">Regulering gjennomført</Alert>}
        </div>
    );
};

export default StartGRegulering;

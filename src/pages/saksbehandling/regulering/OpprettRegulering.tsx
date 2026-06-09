import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading, Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { opprettRegulering } from '~src/features/ReguleringAction.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import * as routes from '~src/lib/routes.ts';
import styles from './opprettRegulering.module.less';

const OpprettRegulering = () => {
    const navigate = useNavigate();
    const { sak } = useOutletContext<SaksoversiktContext>();

    const [opprettStatus, opprett] = useAsyncActionCreator(opprettRegulering);
    const [begrunnelse, setBegrunnelse] = useState('');

    const handleSubmit = () => {
        opprett({ sakId: sak.id, begrunnelse: begrunnelse }, (res) => {
            navigate(
                routes.manuellRegulering.createURL({
                    sakId: sak.id,
                    reguleringId: res.regulering.id,
                }),
            );
        });
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.reguleringHeading} size="large">
                    Opprett manuell regulering
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                <Box
                    background={'bg-default'}
                    padding="4"
                    borderWidth="1"
                    borderRadius="small"
                    className={styles.panelContentContainer}
                >
                    <Textarea
                        label="Begrunnelse"
                        value={begrunnelse}
                        onChange={(e) => setBegrunnelse(e.target.value)}
                    />

                    <div className={styles.knappContainer}>
                        <Button loading={RemoteData.isPending(opprettStatus)} onClick={handleSubmit}>
                            Opprett
                        </Button>
                    </div>

                    {RemoteData.isFailure(opprettStatus) && <ApiErrorAlert error={opprettStatus.error} />}
                </Box>
            </div>
        </div>
    );
};

export default OpprettRegulering;

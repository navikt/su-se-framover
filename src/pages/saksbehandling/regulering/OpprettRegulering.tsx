import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading, Select, Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker.tsx';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { opprettRegulering } from '~src/features/ReguleringAction.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import * as routes from '~src/lib/routes.ts';
import { Nullable } from '~src/lib/types.ts';
import { Reguleringsvariant, reguleringsvarianter } from '~src/types/Regulering.ts';
import styles from './opprettRegulering.module.less';

const OpprettRegulering = () => {
    const navigate = useNavigate();
    const { sak } = useOutletContext<SaksoversiktContext>();

    const [opprettStatus, opprett] = useAsyncActionCreator(opprettRegulering);
    const [begrunnelse, setBegrunnelse] = useState('');
    const [reguleringsvariant, setReguleringsvariant] = useState<Reguleringsvariant>(Reguleringsvariant.GRUNNBELØP);

    const mai = new Date(new Date().getFullYear(), 4, 1);
    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(mai);

    const handleSubmit = () => {
        if (!fraOgMed) {
            return;
        }
        opprett(
            { sakId: sak.id, begrunnelse: begrunnelse, reguleringsvariant: reguleringsvariant, fraOgMed: fraOgMed },
            (res) => {
                navigate(
                    routes.manuellRegulering.createURL({
                        sakId: sak.id,
                        reguleringId: res.regulering.id,
                    }),
                );
            },
        );
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
                    <DatePicker
                        label="Gjeldende sats fra og med"
                        hjelpetekst="Bestemmer hvilken gjelden sats som skal brukes i reguleringen"
                        value={fraOgMed}
                        onChange={setFraOgMed}
                    />

                    <Select
                        label="Reguleringsvariant"
                        onChange={(event) => {
                            setReguleringsvariant(event.target.value as Reguleringsvariant);
                        }}
                    >
                        {reguleringsvarianter.map((variant) => (
                            <option value={variant} key={variant}>
                                {variant}
                            </option>
                        ))}
                    </Select>

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

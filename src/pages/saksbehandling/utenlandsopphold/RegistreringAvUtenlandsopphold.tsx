import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Panel } from '@navikt/ds-react';
import React from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';
import RegistreringAvUtenlandsoppholdForm from './RegistreringAvUtenlandsoppholdForm';

const RegistreringAvUtenlandsopphold = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    const [status, registrerUtenlandsOpphold] = useAsyncActionCreator(SakSlice.registrerUtenlandsopphold);
    return (
        <div className={styles.utenlandsoppholdContainer}>
            <Heading className={styles.heading} size="large">
                {formatMessage('grunnlagForm.heading')}
            </Heading>
            <Panel border>
                <RegistreringAvUtenlandsoppholdForm
                    sakId={props.sakId}
                    status={status}
                    onFormSubmit={(validatedVlaues) =>
                        registrerUtenlandsOpphold({
                            sakId: props.sakId,
                            periode: {
                                fraOgMed: toIsoDateOnlyString(validatedVlaues.periode.fraOgMed!),
                                tilOgMed: toIsoDateOnlyString(validatedVlaues.periode.tilOgMed!),
                            },
                            dokumentasjon: validatedVlaues.dokumentasjon!,
                            journalposter: validatedVlaues.journalposter.map((it) => it.journalpostId!),
                        })
                    }
                >
                    <div className={styles.grunnlagFormButtonsContainer}>
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        >
                            {formatMessage('grunnlagForm.button.tilbake')}
                        </LinkAsButton>
                        <Button loading={RemoteData.isPending(status)}>
                            {formatMessage('grunnlagForm.button.registrer')}
                        </Button>
                    </div>
                </RegistreringAvUtenlandsoppholdForm>
            </Panel>
        </div>
    );
};

export default RegistreringAvUtenlandsopphold;

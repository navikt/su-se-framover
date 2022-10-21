import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import React from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';

import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';
import RegistreringAvUtenlandsoppholdForm from './RegistreringAvUtenlandsoppholdForm';
import { registrerUtenlandsoppholdFormDataTilRegistrerRequest } from './RegistreringAvUtenlandsoppholdFormUtils';

const RegistreringAvUtenlandsopphold = (props: { sakId: string; saksversjon: number }) => {
    const { formatMessage } = useI18n({ messages });
    const [status, registrerUtenlandsOpphold] = useAsyncActionCreator(SakSlice.registrerUtenlandsopphold);
    return (
        <div className={styles.utenlandsoppholdContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Blyant}
                farge={Oppsummeringsfarge.Grønn}
                tittel={formatMessage('registreringAvUtenlandsopphold.form.heading')}
            >
                <RegistreringAvUtenlandsoppholdForm
                    sakId={props.sakId}
                    saksversjon={props.saksversjon}
                    status={status}
                    onFormSubmit={(validatedValues) =>
                        registrerUtenlandsOpphold(
                            registrerUtenlandsoppholdFormDataTilRegistrerRequest({
                                sakId: props.sakId,
                                saksversjon: props.saksversjon,
                                data: validatedValues,
                            })
                        )
                    }
                >
                    <div className={styles.buttonsContainer}>
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        >
                            {formatMessage('registreringAvUtenlandsopphold.form.button.tilbake')}
                        </LinkAsButton>
                        <Button loading={RemoteData.isPending(status)}>
                            {formatMessage('registreringAvUtenlandsopphold.form.button.registrer')}
                        </Button>
                    </div>
                    {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                </RegistreringAvUtenlandsoppholdForm>
            </Oppsummeringspanel>
        </div>
    );
};

export default RegistreringAvUtenlandsopphold;

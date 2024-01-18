import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { registrerUtenlandsoppholdFormDataTilRegistrerRequest } from '~src/components/forms/utenlandsopphold/RegistreringAvUtenlandsoppholdFormUtils';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';

import RegistreringAvUtenlandsoppholdForm from '../../../../components/forms/utenlandsopphold/RegistreringAvUtenlandsoppholdForm';
import messages from '../Utenlandsopphold-nb';

import * as styles from './RegistreringAvUtenlandsopphold.module.less';

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
                    onFormSubmit={(validatedValues, formReset) =>
                        registrerUtenlandsOpphold(
                            registrerUtenlandsoppholdFormDataTilRegistrerRequest({
                                sakId: props.sakId,
                                saksversjon: props.saksversjon,
                                data: validatedValues,
                            }),
                            () => formReset(),
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

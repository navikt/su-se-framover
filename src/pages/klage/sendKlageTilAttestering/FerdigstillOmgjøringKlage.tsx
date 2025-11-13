import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { Link, useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKlage from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedStyles from '~src/pages/klage/klage.module.less';
import styles from '~src/pages/klage/sendKlageTilAttestering/sendKlageTilAttestering.module.less';
import messages from '~src/pages/klage/sendKlageTilAttestering/sendKlageTilAttestering-nb';
import { Klage, KlageSteg } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import { erKlageVurdertBekreftet } from '~src/utils/klage/klageUtils';

/*
    Omgjøring trenger ikke attestering da dette skjer i behandlingsløpet.
 */
export const FerdigstillOmgjøringKlage = (props: { sakId: string; klage: Klage; vedtaker: Vedtak[] }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [ferdigstillOmgjøringStatus, ferdigstillOmgjøring] = useAsyncActionCreator(klageActions.ferdigstillOmgjøring);

    const handleSendTilAttesteringClick = () => {
        ferdigstillOmgjøring(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
            },
            () => {
                Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification.ferdigstilt'), props.sakId);
            },
        );
    };

    if (!erKlageVurdertBekreftet(props.klage)) {
        return (
            <div className={sharedStyles.feilTilstandContainer}>
                <Alert variant="error">{formatMessage('feil.klageErIkkeIRiktigTilstand')}</Alert>
                <Link
                    to={Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: props.klage.id,
                        steg: KlageSteg.Vurdering,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    const klagensVedtak = props.vedtaker.find((v) => v.id === props.klage.vedtakId);

    if (!klagensVedtak) {
        return (
            <div className={sharedStyles.feilTilstandContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeVedtakForKlage')}</Alert>
                <Link
                    to={Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: props.klage.id,
                        steg: KlageSteg.Vurdering,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <OppsummeringAvKlage klage={props.klage} klagensVedtak={klagensVedtak} />
            <div className={styles.knappContainer}>
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            Routes.klage.createURL({
                                sakId: props.sakId,
                                klageId: props.klage.id,
                                steg: KlageSteg.Vurdering,
                            }),
                        )
                    }
                >
                    {formatMessage('knapp.tilbake')}
                </Button>
                <Button variant="primary" onClick={() => handleSendTilAttesteringClick()}>
                    {formatMessage('knapp.ferdigstill')}
                    {RemoteData.isPending(ferdigstillOmgjøringStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(ferdigstillOmgjøringStatus) && (
                <ApiErrorAlert error={ferdigstillOmgjøringStatus.error} />
            )}
        </div>
    );
};

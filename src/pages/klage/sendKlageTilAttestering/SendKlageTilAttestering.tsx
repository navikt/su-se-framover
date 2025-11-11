import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { Link, useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKlage from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Klage, KlageSteg } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import { erKlageVurdertBekreftet } from '~src/utils/klage/klageUtils';

import sharedStyles from '../klage.module.less';
import styles from './sendKlageTilAttestering.module.less';
import messages from './sendKlageTilAttestering-nb';

const SendKlageTilAttestering = (props: { sakId: string; klage: Klage; vedtaker: Vedtak[] }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [sendTilAttesteringStatus, sendtilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);

    const handleSendTilAttesteringClick = () => {
        sendtilAttestering(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
            },
            () => {
                Routes.navigateToSakIntroWithMessage(
                    navigate,
                    formatMessage('notification.sendtTilAttestering'),
                    props.sakId,
                );
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
                    {formatMessage('knapp.sendTilAttestering')}
                    {RemoteData.isPending(sendTilAttesteringStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(sendTilAttesteringStatus) && <ApiErrorAlert error={sendTilAttesteringStatus.error} />}
        </div>
    );
};

export default SendKlageTilAttestering;

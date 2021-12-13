import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { erKlageVurdertBekreftet } from '~utils/klage/klageUtils';

import sharedStyles from '../klage.module.less';

import messages from './sendKlageTilAttestering-nb';
import styles from './sendKlageTilAttestering.module.less';

const SendKlageTilAttestering = (props: { sakId: string; klage: Klage; vedtaker: Vedtak[] }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    const [sendTilAttesteringStatus, sendtilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);

    const handleSendTilAttesteringClick = () => {
        sendtilAttestering(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
            },
            () => {
                history.push(
                    Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId)
                );
            }
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
                        history.push(
                            Routes.klage.createURL({
                                sakId: props.sakId,
                                klageId: props.klage.id,
                                steg: KlageSteg.Vurdering,
                            })
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

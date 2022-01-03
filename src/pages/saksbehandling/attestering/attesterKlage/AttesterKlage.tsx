import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import Attestering from '~components/attestering/Attestering';
import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { UnderkjennelseGrunn } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { erKlageTilAttestering } from '~utils/klage/klageUtils';

import messages from './attesterKlage-nb';
import styles from './attesterKlage.module.less';

const AttesterKlage = (props: { sakId: string; klager: Klage[]; vedtaker: Vedtak[] }) => {
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.attesterKlage>();

    const klage = props.klager.find((k) => k.id === urlParams.klageId);
    const klagensVedtak = props.vedtaker.find((v) => v.id === klage?.vedtakId);

    const [oversendStatus, oversend] = useAsyncActionCreator(klageActions.oversend);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(klageActions.underkjenn);

    if (!klagensVedtak || !klage) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeKlageEllerVedtakensKlage')}</Alert>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sakId,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    if (!erKlageTilAttestering(klage)) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.klageErIkkeTilAttestering')}</Alert>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    const iverksettCallback = () =>
        oversend(
            {
                sakId: props.sakId,
                klageId: klage.id,
            },
            () => {
                history.push(Routes.createSakIntroLocation(formatMessage('notification.oversendt'), props.sakId));
            }
        );

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        underkjenn(
            {
                sakId: props.sakId,
                klageId: klage.id,
                grunn: grunn,
                kommentar: kommentar,
            },
            () => {
                history.push(Routes.createSakIntroLocation(formatMessage('notification.underkjent'), props.sakId));
            }
        );

    return (
        <Attestering
            sakId={props.sakId}
            iverksett={{
                fn: iverksettCallback,
                status: oversendStatus,
            }}
            underkjenn={{
                fn: underkjennCallback,
                status: underkjennStatus,
            }}
        >
            <Heading level="1" size="xlarge" className={styles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
        </Attestering>
    );
};

export default AttesterKlage;

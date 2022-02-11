import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as pdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { AttesteringsForm } from '~components/attestering/AttesteringsForm';
import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { UnderkjennelseGrunn } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import {
    erKlageINoenFormForAvvist,
    erKlageOpprettholdt,
    erKlageTilAttestering,
    erKlageTilAttesteringAvvist,
} from '~utils/klage/klageUtils';

import messages from './attesterKlage-nb';
import styles from './attesterKlage.module.less';

const AttesterKlage = (props: { sakId: string; klager: Klage[]; vedtaker: Vedtak[] }) => {
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.attesterKlage>();

    const klage = props.klager.find((k) => k.id === urlParams.klageId);
    const klagensVedtak = props.vedtaker.find((v) => v.id === klage?.vedtakId);

    const [oversendStatus, oversend] = useAsyncActionCreator(klageActions.oversend);
    const [avvisStatus, avvis] = useAsyncActionCreator(klageActions.iverksattAvvist);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(klageActions.underkjenn);
    const [seBrevStatus, seBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

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

    const iverksettCallback = () => {
        if (erKlageTilAttesteringAvvist(klage)) {
            return avvisCallbackOgStatus();
        } else {
            return oversendCallbackOgStatus();
        }
    };

    const avvisCallbackOgStatus = () => {
        return {
            callback: () =>
                avvis(
                    {
                        sakId: props.sakId,
                        klageId: klage.id,
                    },
                    () => {
                        history.push(Routes.createSakIntroLocation(formatMessage('notification.avvist'), props.sakId));
                    }
                ),
            status: avvisStatus,
        };
    };

    const oversendCallbackOgStatus = () => {
        return {
            callback: () =>
                oversend(
                    {
                        sakId: props.sakId,
                        klageId: klage.id,
                    },
                    () => {
                        history.push(
                            Routes.createSakIntroLocation(formatMessage('notification.oversendt'), props.sakId)
                        );
                    }
                ),
            status: oversendStatus,
        };
    };

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
        <div>
            <Heading level="1" size="xlarge" className={styles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
            <div className={styles.seBrevKnappContainer}>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => seBrev({ sakId: props.sakId, klageId: klage.id })}
                    className={styles.knapp}
                >
                    {formatMessage('knapp.seBrev')}
                    {RemoteData.isPending(seBrevStatus) && <Loader />}
                </Button>
                {RemoteData.isFailure(seBrevStatus) && <ApiErrorAlert error={seBrevStatus.error} />}
            </div>
            <AttesteringsForm
                sakId={props.sakId}
                iverksett={{
                    fn: iverksettCallback().callback,
                    status: iverksettCallback().status,
                }}
                underkjenn={{
                    fn: underkjennCallback,
                    status: underkjennStatus,
                }}
                radioTexts={{
                    bekreftText: erKlageOpprettholdt(klage)
                        ? formatMessage('radio.overførTilKlageinstans')
                        : erKlageINoenFormForAvvist(klage)
                        ? formatMessage('radio.godkjennAvvisning')
                        : undefined,
                }}
            />
        </div>
    );
};

export default AttesterKlage;

import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import AttesteringsForm from '~src/components/forms/attesteringForm/AttesteringsForm';
import OppsummeringAvKlage from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as klageActions from '~src/features/klage/klageActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import {
    erKlageINoenFormForAvvist,
    erKlageOpprettholdt,
    erKlageTilAttestering,
    erKlageTilAttesteringAvvist,
} from '~src/utils/klage/klageUtils';

import * as sharedStyles from '../sharedStyles.module.less';

import messages from './attesterKlage-nb';
import * as styles from './attesterKlage.module.less';

const AttesterKlage = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
    const props = { sakId: sak.id, klager: sak.klager, vedtaker: sak.vedtak };
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const urlParams = Routes.useRouteParams<typeof Routes.attesterKlage>();

    const klage = props.klager.find((k) => k.id === urlParams.klageId);
    const klagensVedtak = props.vedtaker.find((v) => v.id === klage?.vedtakId);

    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const [oversendStatus, oversend] = useAsyncActionCreator(klageActions.oversend);
    const [avvisStatus, avvis] = useAsyncActionCreator(klageActions.iverksattAvvist);
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
                        fetchSak({ sakId: props.sakId }, () => {
                            Routes.navigateToSakIntroWithMessage(
                                navigate,
                                formatMessage('notification.avvist'),
                                props.sakId
                            );
                        });
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
                        Routes.navigateToSakIntroWithMessage(
                            navigate,
                            formatMessage('notification.oversendt'),
                            props.sakId
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
                Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification.underkjent'), props.sakId);
            }
        );

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={sharedStyles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
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

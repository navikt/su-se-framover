import { Alert } from '@navikt/ds-react';
import { Link, useNavigate } from 'react-router-dom';

import AttesteringsForm from '~src/components/forms/attesteringForm/AttesteringsForm';
import OppsummeringAvKlage from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import * as klageActions from '~src/features/klage/klageActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UnderkjennelseGrunn, UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import {
    erKlageDelvisOmgjortKA,
    erKlageINoenFormForAvvist,
    erKlageOpprettholdt,
    erKlageTilAttestering,
    erKlageTilAttesteringAvvist,
} from '~src/utils/klage/klageUtils';

import messages from './attesterKlage-nb';
import styles from './attesterKlage.module.less';

const AttesterKlage = (props: { sakId: string; klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const [oversendStatus, oversend] = useAsyncActionCreator(klageActions.oversend);
    const [avvisStatus, avvis] = useAsyncActionCreator(klageActions.iverksattAvvist);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(klageActions.underkjenn);

    if (!erKlageTilAttestering(props.klage)) {
        return (
            <div>
                <Alert variant="error">{formatMessage('feil.klageErIkkeTilAttestering')}</Alert>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    const iverksettCallback = () => {
        if (erKlageTilAttesteringAvvist(props.klage)) {
            return avvisCallbackOgStatus();
        } else {
            return oversendCallbackOgStatus();
        }
    };

    const avvisCallbackOgStatus = () => {
        return {
            callback: () =>
                avvis({ sakId: props.sakId, klageId: props.klage.id }, () => {
                    fetchSak({ sakId: props.sakId }, () => {
                        Routes.navigateToSakIntroWithMessage(
                            navigate,
                            formatMessage('notification.avvist'),
                            props.sakId,
                        );
                    });
                }),
            status: avvisStatus,
        };
    };

    const oversendCallbackOgStatus = () => {
        return {
            callback: () =>
                oversend(
                    {
                        sakId: props.sakId,
                        klageId: props.klage.id,
                    },
                    () => {
                        Routes.navigateToSakIntroWithMessage(
                            navigate,
                            formatMessage('notification.oversendt'),
                            props.sakId,
                        );
                    },
                ),
            status: oversendStatus,
        };
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        underkjenn(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                grunn: grunn as UnderkjennelseGrunnBehandling,
                kommentar: kommentar,
            },
            () => {
                Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification.underkjent'), props.sakId);
            },
        );

    return (
        <div className={styles.mainContentContainer}>
            <AttesteringsForm
                behandlingsId={props.klage.id}
                fritekst={props.klage.fritekstTilBrev ?? ''}
                redigerbartBrev={false}
                sakId={props.sakId}
                iverksett={{
                    fn: iverksettCallback().callback,
                    status: iverksettCallback().status,
                }}
                underkjenn={{
                    fn: underkjennCallback,
                    status: underkjennStatus,
                    underkjennelsesgrunner: Object.values(UnderkjennelseGrunnBehandling),
                }}
                radioTexts={{
                    bekreftText:
                        erKlageOpprettholdt(props.klage) || erKlageDelvisOmgjortKA(props.klage)
                            ? formatMessage('radio.overførTilKlageinstans')
                            : erKlageINoenFormForAvvist(props.klage)
                              ? formatMessage('radio.godkjennAvvisning')
                              : undefined,
                }}
            />
            <OppsummeringAvKlage klage={props.klage} klagensVedtak={props.klagensVedtak} />
        </div>
    );
};

export default AttesterKlage;

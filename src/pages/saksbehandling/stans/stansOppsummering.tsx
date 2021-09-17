import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import React from 'react';
import { useHistory } from 'react-router';

import * as revurderingApi from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { Utbetalingssimulering } from '~components/beregningOgSimulering/simulering/simulering';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from './stans-nb';
import styles from './stans.module.less';

interface Props {
    sak: Sak;
}

const StansOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const { intl } = useI18n({ messages });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const history = useHistory();

    const [iverksettStatus, iverksettStans] = useApiCall(revurderingApi.iverksettStans);
    const error = RemoteData.isFailure(iverksettStatus) && iverksettStatus.error;

    if (!revurdering) {
        return <AlertStripeFeil> {intl.formatMessage({ id: 'stans.oppsummering.error.fant.ingen' })}</AlertStripeFeil>;
    }
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_STANS;

    return (
        <div className={styles.stansOppsummering}>
            <Panel border className={styles.stansOppsummering}>
                <Utbetalingssimulering simulering={revurdering.simulering} />
                <p> årsak: {revurdering.årsak} </p>
                <p> begrunnelse: {revurdering.begrunnelse} </p>
            </Panel>
            {error && (
                <div className={styles.error}>
                    <ApiErrorAlert error={error} />
                </div>
            )}
            <div className={styles.iverksett}>
                <Knapp
                    onClick={() =>
                        erIverksatt
                            ? history.goBack()
                            : history.push(
                                  Routes.stansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                              )
                    }
                >
                    Tilbake
                </Knapp>
                {!erIverksatt && (
                    <Knapp
                        onClick={() =>
                            iverksettStans({ sakId: props.sak.id, revurderingId: revurdering.id }, () =>
                                history.push(
                                    Routes.createSakIntroLocation(
                                        intl.formatMessage({ id: 'stans.notification' }),
                                        props.sak.id
                                    )
                                )
                            )
                        }
                    >
                        {intl.formatMessage({ id: 'stans.oppsummering.iverksett' })}
                    </Knapp>
                )}
            </div>
        </div>
    );
};

export default StansOppsummering;

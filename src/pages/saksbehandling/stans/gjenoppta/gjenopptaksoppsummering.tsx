import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router';

import * as revurderingApi from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Beregningblokk from '~components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from './gjenoppta-nb';
import styles from './gjenoppta.module.less';

interface Props {
    sak: Sak;
}

const GjenopptaOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansOppsummeringRoute>();
    const { intl } = useI18n({ messages });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const history = useHistory();

    const [iverksettStatus, iverksettGjenopptak] = useApiCall(revurderingApi.iverksettGjenopptak);
    const error = RemoteData.isFailure(iverksettStatus) && iverksettStatus.error;

    if (!revurdering) {
        return <AlertStripeFeil> {intl.formatMessage({ id: 'stans.oppsummering.error.fant.ingen' })}</AlertStripeFeil>;
    }
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_STANS;

    return (
        <div className={styles.stansOppsummering}>
            <Beregningblokk revurdering={revurdering} />
            <p> årsak: {revurdering.årsak} </p>
            <p> begrunnelse: {revurdering.begrunnelse} </p>
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
                                  Routes.gjenopptaStansRoute.createURL({
                                      sakId: props.sak.id,
                                      revurderingId: revurdering.id,
                                  })
                              )
                    }
                >
                    {intl.formatMessage({ id: 'gjenoppta.oppsummering.avslutt' })}
                </Knapp>
                {!erIverksatt && (
                    <Knapp
                        onClick={() =>
                            iverksettGjenopptak({ sakId: props.sak.id, revurderingId: revurdering.id }, () =>
                                history.push(
                                    Routes.createSakIntroLocation(
                                        intl.formatMessage({ id: 'gjenoppta.notification' }),
                                        props.sak.id
                                    )
                                )
                            )
                        }
                    >
                        {intl.formatMessage({ id: 'gjenoppta.oppsummering.iverksett' })}
                    </Knapp>
                )}
            </div>
        </div>
    );
};

export default GjenopptaOppsummering;

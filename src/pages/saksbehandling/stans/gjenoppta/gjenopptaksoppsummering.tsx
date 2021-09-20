import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router';

import * as revurderingApi from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Beregningblokk from '~components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { fetchSak } from '~features/saksoversikt/sak.slice';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import messages from './gjenoppta-nb';
import styles from './gjenoppta.module.less';

interface Props {
    sak: Sak;
}

const GjenopptaOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansOppsummeringRoute>();
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const history = useHistory();
    const dispatch = useAppDispatch();

    const [iverksettStatus, iverksettGjenopptak] = useApiCall(revurderingApi.iverksettGjenopptak);
    const error = RemoteData.isFailure(iverksettStatus) && iverksettStatus.error;

    if (!revurdering) {
        return (
            <AlertStripeFeil> {intl.formatMessage({ id: 'gjenoppta.oppsummering.error.fant.ingen' })}</AlertStripeFeil>
        );
    }
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK;

    return (
        <div className={styles.container}>
            <Beregningblokk revurdering={revurdering} />
            <p>
                {intl.formatMessage({ id: 'gjenoppta.årsak.tittel' })}:
                {intl.formatMessage({
                    id: getRevurderingsårsakMessageId(revurdering.årsak),
                })}
            </p>
            <p>
                {intl.formatMessage({ id: 'gjenoppta.begrunnelse.tittel' })}: {revurdering.begrunnelse}
            </p>
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
                    {intl.formatMessage({ id: 'gjenoppta.oppsummering.tilbake' })}
                </Knapp>
                {!erIverksatt && (
                    <Knapp
                        onClick={() =>
                            iverksettGjenopptak({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
                                await dispatch(fetchSak({ fnr: props.sak.fnr }));
                                history.push(
                                    Routes.createSakIntroLocation(
                                        intl.formatMessage({ id: 'gjenoppta.notification' }),
                                        props.sak.id
                                    )
                                );
                            })
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

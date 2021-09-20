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

import messages from './stans-nb';
import styles from './stans.module.less';

interface Props {
    sak: Sak;
}

const StansOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const history = useHistory();
    const dispatch = useAppDispatch();

    const [iverksettStatus, iverksettStans] = useApiCall(revurderingApi.iverksettStans);
    const error = RemoteData.isFailure(iverksettStatus) && iverksettStatus.error;

    if (!revurdering) {
        return <AlertStripeFeil> {intl.formatMessage({ id: 'stans.oppsummering.error.fant.ingen' })}</AlertStripeFeil>;
    }
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_STANS;

    return (
        <div className={styles.stansOppsummering}>
            <Beregningblokk revurdering={revurdering} />
            <p>
                {intl.formatMessage({ id: 'stans.årsak.tittel' })}:{' '}
                {intl.formatMessage({
                    id: getRevurderingsårsakMessageId(revurdering.årsak),
                })}
            </p>
            <p>
                {intl.formatMessage({ id: 'stans.begrunnelse.tittel' })}: {revurdering.begrunnelse}
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
                                  Routes.stansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                              )
                    }
                >
                    {intl.formatMessage({ id: 'stans.bunnknapper.tilbake' })}
                </Knapp>
                {!erIverksatt && (
                    <Knapp
                        spinner={RemoteData.isPending(iverksettStatus)}
                        onClick={() =>
                            iverksettStans({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
                                await dispatch(fetchSak({ fnr: props.sak.fnr }));
                                history.push(
                                    Routes.createSakIntroLocation(
                                        intl.formatMessage({ id: 'stans.notification' }),
                                        props.sak.id
                                    )
                                );
                            })
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

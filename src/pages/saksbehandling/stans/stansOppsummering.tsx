import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';
import { useHistory } from 'react-router';

import * as revurderingApi from '~api/revurderingApi';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { fetchSak } from '~features/saksoversikt/sak.slice';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import StansOppsummeringskomponent from './components/StansOppsummeringskomponent';
import messages from './stans-nb';

interface Props {
    sak: Sak;
}

const StansOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [iverksettStatus, iverksettStans] = useApiCall(revurderingApi.iverksettStans);
    const error = RemoteData.isFailure(iverksettStatus) ? iverksettStatus.error : null;

    if (!revurdering) {
        return <AlertStripeFeil> {intl.formatMessage({ id: 'stans.oppsummering.error.fant.ingen' })}</AlertStripeFeil>;
    }

    const iverksettOgGåVidere = () => {
        iverksettStans({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSak({ fnr: props.sak.fnr }));
            history.push(Routes.createSakIntroLocation(intl.formatMessage({ id: 'stans.notification' }), props.sak.id));
        });
    };

    const oppsummeringsinputs = [
        {
            label: intl.formatMessage({ id: 'stans.årsak.tittel' }),
            verdi: intl.formatMessage({
                id: getRevurderingsårsakMessageId(revurdering.årsak),
            }),
        },
        {
            label: intl.formatMessage({ id: 'stans.begrunnelse.tittel' }),
            verdi: revurdering.begrunnelse ?? '',
        },
    ];
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_STANS;

    if (erIverksatt) {
        return <StansOppsummeringskomponent revurdering={revurdering} inputs={oppsummeringsinputs} />;
    }

    return (
        <StansOppsummeringskomponent
            revurdering={revurdering}
            inputs={oppsummeringsinputs}
            error={error}
            knapper={{
                tilbake: {
                    tekst: intl.formatMessage({ id: 'stans.bunnknapper.tilbake' }),
                    onClick: () =>
                        history.push(
                            Routes.stansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                        ),
                },
                neste: {
                    tekst: intl.formatMessage({ id: 'stans.oppsummering.iverksett' }),
                    onClick: iverksettOgGåVidere,
                    spinner: RemoteData.isPending(iverksettStatus),
                },
            }}
        />
    );
};

export default StansOppsummering;

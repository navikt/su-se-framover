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

import StansOppsummeringskomponent from '../components/stansoppsummering';

import messages from './gjenoppta-nb';

interface Props {
    sak: Sak;
}

const GjenopptaOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansOppsummeringRoute>();
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const history = useHistory();
    const dispatch = useAppDispatch();

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [iverksettStatus, iverksettGjenopptak] = useApiCall(revurderingApi.iverksettGjenopptak);
    const error = RemoteData.isFailure(iverksettStatus) ? iverksettStatus.error : null;

    if (!revurdering) {
        return (
            <AlertStripeFeil> {intl.formatMessage({ id: 'gjenoppta.oppsummering.error.fant.ingen' })}</AlertStripeFeil>
        );
    }

    const iverksettOgGåVidere = () => {
        iverksettGjenopptak({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSak({ fnr: props.sak.fnr }));
            history.push(
                Routes.createSakIntroLocation(intl.formatMessage({ id: 'gjenoppta.notification' }), props.sak.id)
            );
        });
    };
    const erIverksatt = revurdering.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK;
    const oppsummeringsinputs = [
        {
            label: intl.formatMessage({ id: 'gjenoppta.årsak.tittel' }),
            verdi: intl.formatMessage({
                id: getRevurderingsårsakMessageId(revurdering.årsak),
            }),
        },
        {
            label: intl.formatMessage({ id: 'gjenoppta.begrunnelse.tittel' }),
            verdi: revurdering.begrunnelse ?? '',
        },
    ];

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
                    tekst: intl.formatMessage({ id: 'gjenoppta.oppsummering.tilbake' }),
                    onClick: () =>
                        history.push(
                            Routes.gjenopptaStansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                        ),
                },
                neste: {
                    tekst: intl.formatMessage({ id: 'gjenoppta.oppsummering.iverksett' }),
                    onClick: iverksettOgGåVidere,
                    spinner: RemoteData.isPending(iverksettStatus),
                },
            }}
        />
    );
};

export default GjenopptaOppsummering;

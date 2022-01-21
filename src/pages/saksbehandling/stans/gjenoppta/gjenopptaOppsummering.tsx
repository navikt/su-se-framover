import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert } from '@navikt/ds-react';
import React from 'react';
import { useHistory } from 'react-router';

import * as revurderingApi from '~api/revurderingApi';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { fetchSak } from '~features/saksoversikt/sak.slice';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~redux/Store';
import { UtbetalingsRevurderingStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import StansOppsummeringskomponent from '../components/StansOppsummeringskomponent';

import messages from './gjenoppta-nb';

interface Props {
    sak: Sak;
}

const GjenopptaOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansOppsummeringRoute>();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const history = useHistory();
    const dispatch = useAppDispatch();

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [iverksettStatus, iverksettGjenopptak] = useApiCall(revurderingApi.iverksettGjenopptak);
    const error = RemoteData.isFailure(iverksettStatus) ? iverksettStatus.error : null;

    if (!revurdering) {
        return (
            <div>
                <Alert variant="error"> {formatMessage('gjenoppta.oppsummering.error.fant.ingen')}</Alert>
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    {formatMessage('gjenoppta.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    const iverksettOgGåVidere = () => {
        iverksettGjenopptak({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSak({ fnr: props.sak.fnr }));
            history.push(Routes.createSakIntroLocation(formatMessage('gjenoppta.notification'), props.sak.id));
        });
    };
    const erIverksatt = revurdering.status === UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK;
    const oppsummeringsinputs = [
        {
            label: formatMessage('gjenoppta.årsak.tittel'),
            verdi: formatMessage(revurdering.årsak),
        },
        {
            label: formatMessage('gjenoppta.begrunnelse.tittel'),
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
                    tekst: formatMessage('gjenoppta.oppsummering.tilbake'),
                    onClick: () =>
                        history.push(
                            Routes.gjenopptaStansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                        ),
                },
                neste: {
                    tekst: formatMessage('gjenoppta.oppsummering.iverksett'),
                    onClick: iverksettOgGåVidere,
                    spinner: RemoteData.isPending(iverksettStatus),
                },
            }}
        />
    );
};

export default GjenopptaOppsummering;

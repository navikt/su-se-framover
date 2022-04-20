import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as revurderingApi from '~src/api/revurderingApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { fetchSak } from '~src/features/saksoversikt/sak.slice';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import { UtbetalingsRevurderingStatus } from '~src/types/Revurdering';
import { Sak } from '~src/types/Sak';

import StansOppsummeringskomponent from './components/StansOppsummeringskomponent';
import messages from './stans-nb';
import * as styles from './stans.module.less';

interface Props {
    sak: Sak;
}

const StansOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [iverksettStatus, iverksettStans] = useApiCall(revurderingApi.iverksettStans);
    const error = RemoteData.isFailure(iverksettStatus) ? iverksettStatus.error : null;

    if (!revurdering) {
        return (
            <div>
                <Alert variant="error"> {formatMessage('stans.oppsummering.error.fant.ingen')} </Alert>
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    {formatMessage('stans.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    const iverksettOgGåVidere = () => {
        iverksettStans({ sakId: props.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSak({ fnr: props.sak.fnr }));
            navigate(Routes.createSakIntroLocation(formatMessage('stans.notification'), props.sak.id));
        });
    };

    const oppsummeringsinputs = [
        {
            label: formatMessage('stans.årsak.tittel'),
            verdi: formatMessage(revurdering.årsak),
        },
        {
            label: formatMessage('stans.begrunnelse.tittel'),
            verdi: revurdering.begrunnelse ?? '',
        },
    ];
    const erIverksatt = revurdering.status === UtbetalingsRevurderingStatus.IVERKSATT_STANS;

    if (erIverksatt) {
        return <StansOppsummeringskomponent revurdering={revurdering} inputs={oppsummeringsinputs} />;
    }

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('stans.tittel')}
            </Heading>
            <div className={styles.content}>
                <StansOppsummeringskomponent
                    revurdering={revurdering}
                    inputs={oppsummeringsinputs}
                    error={error}
                    knapper={{
                        tilbake: {
                            tekst: formatMessage('stans.bunnknapper.tilbake'),
                            onClick: () =>
                                navigate(
                                    Routes.stansRoute.createURL({ sakId: props.sak.id, revurderingId: revurdering.id })
                                ),
                        },
                        neste: {
                            tekst: formatMessage('stans.oppsummering.iverksett'),
                            onClick: iverksettOgGåVidere,
                            spinner: RemoteData.isPending(iverksettStatus),
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default StansOppsummering;

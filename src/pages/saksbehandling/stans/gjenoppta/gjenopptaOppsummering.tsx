import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as revurderingApi from '~src/api/revurderingApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { fetchSak } from '~src/features/saksoversikt/sak.slice';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import * as styles from '~src/pages/saksbehandling/stans/gjenoppta/gjenoppta.module.less';
import { useAppDispatch } from '~src/redux/Store';
import { Revurdering, UtbetalingsRevurderingStatus } from '~src/types/Revurdering';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import StansOppsummeringskomponent from '../components/StansOppsummeringskomponent';

import messages from './gjenoppta-nb';

const GjenopptaOppsummering = (props: { revurdering?: Revurdering }) => {
    const contextProps = useOutletContext<AttesteringContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansOppsummeringRoute>();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const revurderingId = props.revurdering?.id ?? urlParams.revurderingId;
    const revurdering = contextProps.sak.revurderinger.find((r) => r.id === revurderingId);
    const [iverksettStatus, iverksettGjenopptak] = useApiCall(revurderingApi.iverksettGjenopptak);
    const error = RemoteData.isFailure(iverksettStatus) ? iverksettStatus.error : null;

    if (!revurdering) {
        return (
            <div>
                <Alert variant="error"> {formatMessage('gjenoppta.oppsummering.error.fant.ingen')}</Alert>
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: contextProps.sak.id })}>
                    {formatMessage('gjenoppta.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    const iverksettOgGåVidere = () => {
        iverksettGjenopptak({ sakId: contextProps.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSak({ fnr: contextProps.sak.fnr }));
            Routes.navigateToSakIntroWithMessage(
                navigate,
                formatMessage('gjenoppta.notification'),
                contextProps.sak.id
            );
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
        <>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('gjenoppta.tittel')}
            </Heading>
            <StansOppsummeringskomponent
                revurdering={revurdering}
                inputs={oppsummeringsinputs}
                error={error}
                knapper={{
                    tilbake: {
                        tekst: formatMessage('gjenoppta.oppsummering.tilbake'),
                        onClick: () =>
                            navigate(
                                Routes.gjenopptaStansRoute.createURL({
                                    sakId: contextProps.sak.id,
                                    revurderingId: revurdering.id,
                                })
                            ),
                    },
                    neste: {
                        tekst: formatMessage('gjenoppta.oppsummering.iverksett'),
                        onClick: iverksettOgGåVidere,
                        spinner: RemoteData.isPending(iverksettStatus),
                    },
                }}
            />
        </>
    );
};

export default GjenopptaOppsummering;

import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button } from '@navikt/ds-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as revurderingApi from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvUtbetalingsrevurdering from '~src/components/oppsummering/oppsummeringAvRevurdering/utbetalingsrevurdering/OppsummeringAvUtbetalingsrevurdering';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { fetchSakByIdEllerNummer } from '~src/features/saksoversikt/sak.slice';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import { Revurdering, UtbetalingsRevurderingStatus } from '~src/types/Revurdering';
import { erUtbetalingsrevurdering } from '~src/utils/revurdering/revurderingUtils';
import styles from './StansStyles.module.less';
import messages from './stans-nb';

const StansOppsummering = (props: { revurdering?: Revurdering }) => {
    const contextProps = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const revurderingId = props.revurdering?.id ?? urlParams.revurderingId;
    const revurdering = contextProps.sak.revurderinger.find((r) => r.id === revurderingId);
    const [iverksettStatus, iverksettStans] = useApiCall(revurderingApi.iverksettStans);

    if (!revurdering) {
        return (
            <div>
                <Alert variant="error"> {formatMessage('stans.oppsummering.error.fant.ingen')} </Alert>
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: contextProps.sak.id })}>
                    {formatMessage('stans.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    if (!erUtbetalingsrevurdering(revurdering)) {
        return (
            <div>
                <Alert variant="error"> {formatMessage('stans.oppsummering.feilRevurderingstype')}</Alert>
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: contextProps.sak.id })}>
                    {formatMessage('stans.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    const iverksettOgGåVidere = () => {
        iverksettStans({ sakId: contextProps.sak.id, revurderingId: revurdering.id }, async () => {
            await dispatch(fetchSakByIdEllerNummer({ sakId: contextProps.sak.id }));
            Routes.navigateToSakIntroWithMessage(navigate, formatMessage('stans.notification'), contextProps.sak.id);
        });
    };

    if (revurdering.status === UtbetalingsRevurderingStatus.IVERKSATT_STANS) {
        return (
            <div>
                <OppsummeringAvUtbetalingsrevurdering revurdering={revurdering} />
                <LinkAsButton
                    variant="secondary"
                    href={Routes.saksoversiktValgtSak.createURL({ sakId: contextProps.sak.id })}
                >
                    {formatMessage('stans.bunnknapper.tilbake')}
                </LinkAsButton>
            </div>
        );
    }

    return (
        <div className={styles.oppsummeringContainer}>
            <OppsummeringAvUtbetalingsrevurdering revurdering={revurdering} />
            {RemoteData.isFailure(iverksettStatus) && <ApiErrorAlert error={iverksettStatus.error} />}
            <div className={styles.oppsummeringsknapperContainer}>
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            Routes.oppdaterStansRoute.createURL({
                                sakId: contextProps.sak.id,
                                revurderingId: revurdering.id,
                            }),
                        )
                    }
                >
                    {formatMessage('stans.bunnknapper.tilbake')}
                </Button>
                <Button onClick={iverksettOgGåVidere} loading={RemoteData.isPending(iverksettStatus)}>
                    {formatMessage('stans.oppsummering.iverksett')}
                </Button>
            </div>
        </div>
    );
};

export default StansOppsummering;

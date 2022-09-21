import { Button } from '@navikt/ds-react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Søknadsbehandlingoppsummering from '~src/components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import { VedtakType } from '~src/types/Vedtak';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import GjenopptaOppsummering from '../stans/gjenoppta/gjenopptaOppsummering';
import StansOppsummering from '../stans/stansOppsummering';

import Klagevedtaksoppsummering from './klagevedtaksoppsummering/klagevedtaksoppsummering';
import ReguleringVedtaksoppsummering from './reguleringsvedtaksoppsummering/reguleringVedtaksoppsummering';
import RevurderingsoppsummeringWithSnapshot from './revurderingsvedtakWithSnapshot/RevurderingsoppsummeringWithSnapshot';
import messages from './vedtaksoppsummering-nb';
import * as styles from './vedtaksoppsummering.module.less';

const Vedtaksoppsummering = (props: { vedtakId?: string; ikkeVisTilbakeKnapp?: boolean }) => {
    const contextProps = useOutletContext<AttesteringContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();

    const vedtakId = props.vedtakId ?? urlParams.vedtakId;
    const vedtak = contextProps.sak.vedtak.find((v) => v.id === vedtakId);

    const Oppsummering = (): JSX.Element => {
        switch (vedtak?.type) {
            case VedtakType.AVVIST_KLAGE:
                return (
                    <Klagevedtaksoppsummering
                        vedtak={vedtak}
                        klage={contextProps.sak.klager.find((k) => k.id === vedtak.behandlingId)!}
                    />
                );
            case VedtakType.ENDRING:
            case VedtakType.INGEN_ENDRING:
            case VedtakType.OPPHØR:
                return (
                    <RevurderingsoppsummeringWithSnapshot
                        revurdering={
                            contextProps.sak.revurderinger.find(
                                (r) => r.id === vedtak.behandlingId
                            )! as InformasjonsRevurdering
                        }
                        formatMessage={formatMessage}
                        sakId={contextProps.sak.id}
                        vedtakId={vedtak.id}
                    />
                );

            case VedtakType.GJENOPPTAK_AV_YTELSE:
                return (
                    <GjenopptaOppsummering
                        revurdering={contextProps.sak.revurderinger.find((r) => r.id === vedtak.behandlingId)!}
                    />
                );
            case VedtakType.STANS_AV_YTELSE:
                return (
                    <StansOppsummering
                        revurdering={contextProps.sak.revurderinger.find((r) => r.id === vedtak.behandlingId)!}
                    />
                );

            case VedtakType.REGULERING:
                return (
                    <ReguleringVedtaksoppsummering
                        sakId={contextProps.sak.id}
                        vedtak={vedtak}
                        regulering={contextProps.sak.reguleringer.find((r) => r.id === vedtak.behandlingId)!}
                    />
                );

            case VedtakType.AVSLAG:
            case VedtakType.SØKNAD:
                return (
                    <Søknadsbehandlingoppsummering
                        sak={contextProps.sak}
                        behandling={contextProps.sak.behandlinger.find((b) => b.id === vedtak.behandlingId)!}
                        vedtakForBehandling={vedtak}
                        medBrevutkastknapp
                    />
                );
            case undefined:
                return <div>{formatMessage('feilmelding.fantIkkeVedtak')}</div>;
        }
    };

    return (
        <div className={styles.container}>
            <Oppsummering />
            {!props.ikkeVisTilbakeKnapp && (
                <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
        </div>
    );
};

export default Vedtaksoppsummering;

import { Button } from '@navikt/ds-react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Søknadsbehandlingoppsummering from '~src/components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import Klagevedtaksoppsummering from './klagevedtaksoppsummering/klagevedtaksoppsummering';
import ReguleringVedtaksoppsummering from './reguleringsvedtaksoppsummering/reguleringVedtaksoppsummering';
import RevurderingsoppsummeringWithSnapshot from './revurderingsvedtakWithSnapshot/RevurderingsoppsummeringWithSnapshot';
import { hentInformasjonKnyttetTilVedtak, hentKlagevedtakFraKlageinstans } from './utils';
import messages from './vedtaksoppsummering-nb';
import * as styles from './vedtaksoppsummering.module.less';

const Vedtaksoppsummering = () => {
    const props = useOutletContext<AttesteringContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);

    const vedtaksinformasjon = vedtak
        ? hentInformasjonKnyttetTilVedtak(props.sak, vedtak)
        : hentKlagevedtakFraKlageinstans(props.sak, urlParams.vedtakId);

    const Oppsummering = () => {
        switch (vedtaksinformasjon?.type) {
            case 'revurdering':
                return (
                    <RevurderingsoppsummeringWithSnapshot
                        revurdering={vedtaksinformasjon.revurdering}
                        formatMessage={formatMessage}
                        sakId={props.sak.id}
                        vedtakId={vedtaksinformasjon.vedtak.id}
                    />
                );
            case 'søknadsbehandling':
                return (
                    <Søknadsbehandlingoppsummering
                        sak={props.sak}
                        behandling={vedtaksinformasjon.behandling}
                        vedtakForBehandling={vedtaksinformasjon.vedtak}
                        medBrevutkastknapp
                    />
                );
            case 'klage':
                return <Klagevedtaksoppsummering vedtak={vedtaksinformasjon.vedtak} klage={vedtaksinformasjon.klage} />;
            case 'regulering':
                return (
                    <ReguleringVedtaksoppsummering
                        sakId={props.sak.id}
                        vedtak={vedtaksinformasjon.vedtak}
                        regulering={vedtaksinformasjon.regulering}
                    />
                );
            case undefined:
                return <div>{formatMessage('feilmelding.fantIkkeVedtak')}</div>;
        }
    };

    return (
        <div className={styles.container}>
            <Oppsummering />
            <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                {formatMessage('knapp.tilbake')}
            </Button>
        </div>
    );
};

export default Vedtaksoppsummering;

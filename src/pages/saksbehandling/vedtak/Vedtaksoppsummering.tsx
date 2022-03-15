import { Button } from '@navikt/ds-react';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import Klagevedtaksoppsummering from './klagevedtaksoppsummering/klagevedtaksoppsummering';
import RevurderingsoppsummeringWithSnapshot from './revurderingsvedtakWithSnapshot/RevurderingsoppsummeringWithSnapshot';
import { hentInformasjonKnyttetTilVedtak, hentKlagevedtakFraKlageinstans } from './utils';
import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);

    const vedtaksinformasjon = vedtak
        ? hentInformasjonKnyttetTilVedtak(props.sak, vedtak)
        : hentKlagevedtakFraKlageinstans(props.sak, urlParams.vedtakId);

    const renderOppsummering = () => {
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
            case undefined:
                return <div>{formatMessage('feilmelding.fantIkkeVedtak')}</div>;
        }
    };

    return (
        <div className={styles.container}>
            {renderOppsummering()}
            <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => history.goBack()}>
                {formatMessage('knapp.tilbake')}
            </Button>
        </div>
    );
};

export default Vedtaksoppsummering;

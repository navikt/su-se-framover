import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import RevurderingsoppsummeringWithSnapshot from './revurderingsvedtakWithSnapshot/RevurderingsoppsummeringWithSnapshot';
import { hentInformasjonKnyttetTilVedtak } from './utils';
import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { intl } = useI18n({ messages });
    const history = useHistory();
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);
    if (!vedtak) return <div>{intl.formatMessage({ id: 'feilmelding.fantIkkeVedtak' })}</div>;

    const vedtaksinformasjon = hentInformasjonKnyttetTilVedtak(props.sak, vedtak);

    const renderOppsummering = () => {
        switch (vedtaksinformasjon?.type) {
            case 'revurdering':
                return (
                    <RevurderingsoppsummeringWithSnapshot
                        revurdering={vedtaksinformasjon.revurdering}
                        intl={intl}
                        sakId={props.sak.id}
                        vedtakId={vedtak.id}
                    />
                );
            case 'søknadsbehandling':
                return (
                    <Søknadsbehandlingoppsummering
                        sak={props.sak}
                        behandling={vedtaksinformasjon.behandling}
                        vedtakForBehandling={vedtak}
                        medBrevutkastknapp
                    />
                );
            default:
                return <div>{intl.formatMessage({ id: 'feilmelding.fantIkkeVedtak' })}</div>;
        }
    };

    return (
        <div className={styles.container}>
            {renderOppsummering()}
            <Knapp htmlType="button" className={styles.tilbakeKnapp} onClick={() => history.goBack()}>
                {intl.formatMessage({ id: 'knapp.tilbake' })}
            </Knapp>
        </div>
    );
};

export default Vedtaksoppsummering;

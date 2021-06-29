import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Revurderingoppsummering from '~features/revurdering/revurderingoppsummering/Revurderingoppsummering';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

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
                    <Revurderingoppsummering
                        revurdering={vedtaksinformasjon.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={
                            vedtaksinformasjon.forrigeBehandling.grunnlagsdataOgVilkårsvurderinger
                        }
                    />
                );

            // TODO ai: legg till støtte for søknadsbehandlingsoppsummering
            case 'søknadsbehandling':
            case undefined:
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

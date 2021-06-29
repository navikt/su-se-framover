import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Revurderingoppsummering from '~features/revurdering/revurderingoppsummering/Revurderingoppsummering';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Behandling } from '~types/Behandling';
import { IverksattRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';

import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

function hentRevurderingOgKnyttetBehandling(sak: Sak, vedtak: Vedtak) {
    const revurderingSomFørteTilVedtak = sak.revurderinger.find(
        (b) => b.id === vedtak.behandlingId
    ) as IverksattRevurdering;

    const revurdertBehandling = sak.behandlinger.find(
        (behandling) => behandling.id === revurderingSomFørteTilVedtak.tilRevurdering.behandlingId
    ) as Behandling;

    return {
        revurdering: revurderingSomFørteTilVedtak,
        behandling: revurdertBehandling,
    };
}

const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { intl } = useI18n({ messages });
    const history = useHistory();
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);
    if (!vedtak) return <div>{intl.formatMessage({ id: 'feilmelding.fantIkkeVedtak' })}</div>;

    const { revurdering, behandling } = hentRevurderingOgKnyttetBehandling(props.sak, vedtak);

    return (
        <div className={styles.container}>
            <Revurderingoppsummering
                revurdering={revurdering}
                grunnlagsdataOgVilkårsvurderinger={behandling.grunnlagsdataOgVilkårsvurderinger}
            />

            <Knapp htmlType="button" className={styles.tilbakeKnapp} onClick={() => history.goBack()}>
                {intl.formatMessage({ id: 'knapp.tilbake' })}
            </Knapp>
        </div>
    );
};

export default Vedtaksoppsummering;

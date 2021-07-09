import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { hentTidligereGrunnlagsdataForVedtak } from '~api/revurderingApi';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import { pipe } from '~lib/fp';
import { useApiCall, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import { hentInformasjonKnyttetTilVedtak } from './utils';
import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

const RevurderingsoppsummeringWithSnapshot = (props: {
    revurdering: Revurdering;
    sakId: string;
    vedtakId: string;
    intl: IntlShape;
}) => {
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);

    useEffect(() => {
        hentRevurderingSnapshot({ sakId: props.sakId, vedtakId: props.vedtakId });
    }, []);

    return (
        <div>
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <NavFrontendSpinner />,
                    () => <NavFrontendSpinner />,
                    (error) => (
                        <AlertStripeFeil>
                            {error?.body?.message ?? props.intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </AlertStripeFeil>
                    ),
                    (snapshot) => (
                        <Revurderingoppsummering
                            revurdering={props.revurdering}
                            forrigeGrunnlagsdataOgVilkårsvurderinger={snapshot}
                        />
                    )
                )
            )}
        </div>
    );
};

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

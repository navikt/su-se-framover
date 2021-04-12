import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Element, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { fetchBrevutkastForRevurdering } from '~api/pdfApi';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { IverksattRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { VedtakType } from '~types/Vedtak';

import RevurderingÅrsakOgBegrunnelse from '../../components/RevurderingÅrsakOgBegrunnelse/RevurderingÅrsakOgBegrunnelse';

import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

const vedtaksresultatToTekst = (type: VedtakType, intl: IntlShape): string => {
    switch (type) {
        case VedtakType.SØKNAD:
            return intl.formatMessage({ id: 'vedtaktype.søknad' });
        case VedtakType.AVSLAG:
            return intl.formatMessage({ id: 'vedtaktype.avslått' });
        case VedtakType.ENDRING:
            return intl.formatMessage({ id: 'vedtaktype.endring' });
        case VedtakType.OPPHØR:
            return intl.formatMessage({ id: 'vedtaktype.opphør' });
        case VedtakType.INGEN_ENDRING:
            return intl.formatMessage({ id: 'vedtaktype.ingenendring' });
    }
};

/* TODO ai 16.03.2021: Denna støtter pt innvilgede revurderingsvedtak. Må sørge for att søknadsbehandling og andre resultat støttes i framtiden. */
const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const intl = useI18n({ messages });
    const [fetchVedtaksbrev, setFetchVedtaksbrev] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);
    if (!vedtak) return <div>{intl.formatMessage({ id: 'feilmelding.fantIkkeVedtak' })}</div>;

    const revurderingSomFørteTilVedtak = props.sak.revurderinger.find(
        (b) => b.id === vedtak.behandlingId
    ) as IverksattRevurdering;

    const hentVedtaksbrev = async () => {
        setFetchVedtaksbrev(RemoteData.pending);

        const res = await fetchBrevutkastForRevurdering(props.sak.id, vedtak.behandlingId);
        if (res.status === 'ok') {
            setFetchVedtaksbrev(RemoteData.success(null));
            window.open(URL.createObjectURL(res.data));
        } else {
            setFetchVedtaksbrev(RemoteData.failure(res.error));
        }
    };

    const InfoHeader = () => {
        return (
            <div>
                <div className={styles.infoHeader}>
                    <div>
                        <Element>{intl.formatMessage({ id: 'resultat.tittel' })}</Element>
                        <p>{vedtaksresultatToTekst(vedtak.type, intl)}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandlet.av' })}</Element>
                        <p>{vedtak.saksbehandler}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'attestert.av' })}</Element>
                        <p>{vedtak.attestant}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'vedtak.dato' })}</Element>
                        <p>{intl.formatDate(vedtak.opprettet)}</p>
                    </div>
                    <div>
                        <Element>{intl.formatMessage({ id: 'vedtak.brev' })}</Element>
                        {revurderingSomFørteTilVedtak.skalFøreTilBrevutsending ? (
                            <Knapp
                                spinner={RemoteData.isPending(fetchVedtaksbrev)}
                                mini
                                htmlType="button"
                                onClick={hentVedtaksbrev}
                            >
                                {intl.formatMessage({ id: 'knapp.vis' })}
                            </Knapp>
                        ) : (
                            intl.formatMessage({ id: 'vedtak.ingenBrev' })
                        )}
                    </div>
                </div>
                <div className={styles.brevutkastFeil}>
                    {RemoteData.isFailure(fetchVedtaksbrev) && (
                        <AlertStripeFeil>
                            {fetchVedtaksbrev.error.body?.message ??
                                intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </AlertStripeFeil>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Innholdstittel className={styles.tittel}> {intl.formatMessage({ id: 'tittel' })}</Innholdstittel>
            {revurderingSomFørteTilVedtak && (
                <RevurderingÅrsakOgBegrunnelse
                    className={styles.revurderingInfo}
                    revurdering={revurderingSomFørteTilVedtak}
                />
            )}
            <InfoHeader />
            <VisBeregning beregning={vedtak.beregning} />
            <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })} className="knapp">
                {intl.formatMessage({ id: 'knapp.tilbake' })}
            </Link>
        </div>
    );
};

export default Vedtaksoppsummering;

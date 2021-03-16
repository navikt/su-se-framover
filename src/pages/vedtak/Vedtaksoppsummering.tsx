import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Element, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { fetchBrevutkastForRevurdering } from '~api/pdfApi';
import { useUserContext } from '~context/userContext';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { Sak } from '~types/Sak';

import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}

const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const intl = useI18n({ messages });
    const user = useUserContext();
    const [fetchVedtaksbrev, setFetchVedtaksbrev] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);
    if (!vedtak) return <div>{intl.formatMessage({ id: 'feilmelding.fantIkkeVedtak' })}</div>;

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

    const Tilleggsinfo = () => {
        return (
            <div>
                <div className={styles.tilleggsinfoContainer}>
                    <div>
                        <Element>{intl.formatMessage({ id: 'resultat.tittel' })}</Element>
                        <p>{vedtak.resultat}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandlet.av' })}</Element>
                        <p>{vedtak.saksbehandler || user.navn}</p>
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
                        <Knapp
                            spinner={RemoteData.isPending(fetchVedtaksbrev)}
                            mini
                            htmlType="button"
                            onClick={hentVedtaksbrev}
                        >
                            {intl.formatMessage({ id: 'knapp.vis' })}
                        </Knapp>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Innholdstittel className={styles.tittel}> Oppsummering av vedtak</Innholdstittel>
            <Tilleggsinfo />
            <VisBeregning beregning={vedtak.beregning} />
            <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })} className="knapp">
                {intl.formatMessage({ id: 'knapp.tilbake' })}
            </Link>
        </div>
    );
};

export default Vedtaksoppsummering;

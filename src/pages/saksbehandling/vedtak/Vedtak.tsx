import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { erAvslått, erTilAttestering, harBeregning } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { lastNedBrev } from '~features/saksoversikt/sak.slice';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes.ts';
import { VisSimulering } from '~pages/saksbehandling/simulering/simulering';
import VisBeregning from '~pages/saksbehandling/steg/beregning/VisBeregning';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import VilkårsOppsummering from '../vilkårsOppsummering/VilkårsOppsummering';

import messages from './vedtak-nb';
import styles from './vedtak.module.less';
type Props = {
    sak: Sak;
};

const Vedtak = (props: Props) => {
    const { sak } = props;
    const intl = useI18n({ messages });

    const dispatch = useAppDispatch();
    const { sendtTilAttesteringStatus, lastNedBrevStatus } = useAppSelector((s) => s.sak);
    const { sakId, behandlingId } = routes.useRouteParams<typeof routes.saksoversiktValgtBehandling>();
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    const hentBrev = useCallback(() => {
        if (RemoteData.isPending(lastNedBrevStatus)) {
            return;
        }

        dispatch(lastNedBrev({ sakId: sak.id, behandlingId: behandlingId })).then((action) => {
            if (lastNedBrev.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [sak.id, behandlingId]);

    if (!behandling) {
        return <AlertStripe type="feil">{intl.formatMessage({ id: 'feilmelding.fantIkkeBehandlingsId' })}</AlertStripe>;
    }

    if (erTilAttestering(behandling)) {
        return (
            <AlertStripeSuksess className={styles.vedtakSendtTilAttesteringAlertStripe}>
                <p>{intl.formatMessage({ id: 'vedtak.sendtTilAttestering' })}</p>
                <Link to={routes.saksoversiktIndex.createURL()}>
                    {intl.formatMessage({ id: 'vedtak.sendtTilAttestering.lenkeSaksoversikt' })}
                </Link>
            </AlertStripeSuksess>
        );
    }

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: sakId,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = mapToVilkårsinformasjon(behandling.behandlingsinformasjon)
        .reverse()
        .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert);

    if (behandling.status === Behandlingsstatus.SIMULERT || erAvslått(behandling)) {
        return (
            <div className={styles.vedtakContainer}>
                <div>
                    <Innholdstittel className={styles.pageTittel}>
                        {intl.formatMessage({ id: 'page.tittel' })}
                    </Innholdstittel>

                    <div className={styles.statusContainer}>
                        {behandling.status === Behandlingsstatus.SIMULERT && (
                            <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>
                        )}
                        {erAvslått(behandling) && <AlertStripeFeil>{behandling.status}</AlertStripeFeil>}
                    </div>

                    <VilkårsOppsummering
                        søknadInnhold={behandling.søknad.søknadInnhold}
                        behandlingsinformasjon={behandling.behandlingsinformasjon}
                    />

                    {harBeregning(behandling) ? (
                        <VisSimuleringOgBeregning sak={sak} behandling={behandling} />
                    ) : (
                        <>{intl.formatMessage({ id: 'feilmelding.ikkeGjortEnBeregning' })}</>
                    )}

                    <div>
                        <Innholdstittel>{intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Innholdstittel>
                        <Knapp spinner={RemoteData.isPending(lastNedBrevStatus)} htmlType="button" onClick={hentBrev}>
                            {intl.formatMessage({ id: 'knapp.vis' })}
                        </Knapp>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <Link
                        to={
                            erAvslått(behandling) && behandling.status !== Behandlingsstatus.BEREGNET_AVSLAG
                                ? vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte)
                                : vilkårUrl(Vilkårtype.Beregning)
                        }
                        className="knapp"
                    >
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Link>
                    <Hovedknapp
                        spinner={RemoteData.isPending(sendtTilAttesteringStatus)}
                        onClick={() =>
                            dispatch(sakSlice.sendTilAttestering({ sakId: sak.id, behandlingId: behandlingId }))
                        }
                        htmlType="button"
                    >
                        {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                    </Hovedknapp>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <AlertStripeFeil>
                        <div>
                            {intl.formatMessage({ id: 'feilmelding.sendingFeilet' })}
                            <p>
                                {intl.formatMessage({ id: 'feilmelding.errorkode' })}{' '}
                                {sendtTilAttesteringStatus.error.statusCode}
                            </p>
                        </div>
                    </AlertStripeFeil>
                )}
            </div>
        );
    }

    return <div>Behandlingen er ikke ferdig</div>;
};

const VisSimuleringOgBeregning = (props: { sak: Sak; behandling: Behandling }) => (
    <div>
        {props.behandling.beregning && (
            <>
                <VisBeregning
                    beregning={props.behandling.beregning}
                    forventetinntekt={props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0}
                />
                {props.behandling.status !== Behandlingsstatus.BEREGNET_AVSLAG && (
                    <div>
                        <VisSimulering sak={props.sak} behandling={props.behandling} />
                    </div>
                )}
            </>
        )}
    </div>
);

export default Vedtak;

import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { erAvslått, erTilAttestering, harBeregning } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { lastNedBrev } from '~features/saksoversikt/sak.slice';
import {
    createVilkårUrl,
    mapToVilkårsinformasjon,
    statusIcon,
    vilkårTittelFormatted,
} from '~features/saksoversikt/utils';
import * as routes from '~lib/routes.ts';
import { Nullable } from '~lib/types';
import { Simulering } from '~pages/saksbehandling/simulering/simulering';
import VisBeregning from '~pages/saksbehandling/steg/beregning/VisBeregning';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
};

const Vedtak = (props: Props) => {
    const { sak } = props;
    const dispatch = useAppDispatch();
    const { sendtTilAttesteringStatus, lastNedBrevStatus } = useAppSelector((s) => s.sak);
    const { sakId, behandlingId } = routes.useRouteParams<typeof routes.saksoversiktValgtBehandling>();
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    if (!behandling) {
        return <AlertStripe type="feil">Fant ikke behandlingsid</AlertStripe>;
    }

    if (erTilAttestering(behandling)) {
        return <div>Vedtak er sendt til Attestering</div>;
    }

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

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: sakId,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    if (behandling.status === Behandlingsstatus.SIMULERT || erAvslått(behandling)) {
        return (
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>

                    {behandling.status === Behandlingsstatus.SIMULERT && (
                        <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>
                    )}
                    {erAvslått(behandling) && <AlertStripeFeil>{behandling.status}</AlertStripeFeil>}

                    <VilkårsOppsummering behandling={behandling} />

                    {harBeregning(behandling) ? (
                        <VisSimuleringOgBeregning sak={sak} behandling={behandling} />
                    ) : (
                        <>Det er ikke gjort en beregning</>
                    )}

                    <div>
                        <Innholdstittel>Utkast vedtaksbrev</Innholdstittel>
                        <Knapp spinner={RemoteData.isPending(lastNedBrevStatus)} htmlType="button" onClick={hentBrev}>
                            Vis
                        </Knapp>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <Link
                        to={
                            erAvslått(behandling) && behandling.status !== Behandlingsstatus.BEREGNET_AVSLAG
                                ? vilkårUrl(Vilkårtype.PersonligOppmøte)
                                : vilkårUrl(Vilkårtype.Beregning)
                        }
                        className="knapp"
                    >
                        Tilbake
                    </Link>
                    <Hovedknapp
                        spinner={RemoteData.isPending(sendtTilAttesteringStatus)}
                        onClick={() =>
                            dispatch(sakSlice.sendTilAttestering({ sakId: sak.id, behandlingId: behandlingId }))
                        }
                        htmlType="button"
                    >
                        Send til attestering
                    </Hovedknapp>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <AlertStripeFeil>
                        <div>
                            <p>Sendingen Failet</p>
                            <p>Error code: {sendtTilAttesteringStatus.error.statusCode}</p>
                        </div>
                    </AlertStripeFeil>
                )}
            </div>
        );
    }

    return <div>Behandlingen er ikke ferdig</div>;
};

const VilkårsvurderingInfoLinje = (props: {
    type: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse: Nullable<string>;
}) => {
    return (
        <div className={styles.infolinjeContainer}>
            <div className={styles.infolinje}>
                <span className={styles.statusContainer}>
                    <span className={styles.statusIcon}>{statusIcon(props.status)}</span>
                </span>
                <div>
                    <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
                    <p>{props.begrunnelse ?? ''}</p>
                </div>
            </div>
        </div>
    );
};

const VilkårsOppsummering = (props: { behandling: Behandling }) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandling.behandlingsinformasjon);

    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {vilkårsinformasjon.map((v, index) => (
                <VilkårsvurderingInfoLinje
                    type={v.vilkårtype}
                    status={v.status}
                    key={index}
                    begrunnelse={v.begrunnelse ?? null}
                />
            ))}
        </div>
    );
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
                        <Simulering sak={props.sak} behandlingId={props.behandling.id} />
                    </div>
                )}
            </>
        )}
    </div>
);

export default Vedtak;

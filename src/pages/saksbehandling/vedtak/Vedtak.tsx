import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React from 'react';
import { Link } from 'react-router-dom';

import { fetchBrev } from '~api/brevApi';
import { tilAttestering } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { mapToVilkårsinformasjon, statusIcon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import * as routes from '~lib/routes.ts';
import { Nullable } from '~lib/types';
import VisBeregning from '~pages/saksbehandling/beregning/VisBeregning';
import { Simulering } from '~pages/saksbehandling/simulering/simulering';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
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

const VisDersomSimulert = (props: { sak: Sak; behandling: Behandling }) => {
    if (props.behandling.status === Behandlingsstatus.SIMULERT && props.behandling.beregning) {
        return (
            <>
                <VisBeregning beregning={props.behandling.beregning} />
                <div>
                    <Simulering sak={props.sak} behandlingId={props.behandling.id} />
                </div>
            </>
        );
    }
    return <>Det er ikke gjort en beregning</>;
};

const Vedtak = (props: Props) => {
    const sendtTilAttesteringStatus = useAppSelector((s) => s.sak.sendtTilAttesteringStatus);
    const dispatch = useAppDispatch();

    const { sak } = props;
    const { behandlingId } = routes.useRouteParams<typeof routes.saksoversiktValgtBehandling>();

    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    if (!behandling) {
        return <AlertStripe type="feil">Fant ikke behandlingsid</AlertStripe>;
    }

    if (tilAttestering(behandling)) {
        return <div>Vedtak er sendt til Attestering</div>;
    }

    if (
        behandling.status === Behandlingsstatus.SIMULERT ||
        behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
    ) {
        return (
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {behandling.status === Behandlingsstatus.SIMULERT && (
                            <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>
                        )}
                        {behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG && (
                            <AlertStripeFeil>{behandling.status}</AlertStripeFeil>
                        )}
                    </div>
                    <div>
                        <VilkårsOppsummering behandling={behandling} />
                    </div>
                    <div>
                        <VisDersomSimulert sak={sak} behandling={behandling} />
                    </div>
                    <div>
                        <Innholdstittel>Vis brev kladd</Innholdstittel>
                        <Lenke
                            href={'#'}
                            onClick={() =>
                                fetchBrev(sak.id, behandlingId).then((res) => {
                                    if (res.status === 'ok') window.open(URL.createObjectURL(res.data));
                                })
                            }
                        >
                            test
                        </Lenke>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <Link
                        to={routes.saksbehandlingVilkårsvurdering.createURL({
                            sakId: sak.id,
                            behandlingId: behandling.id,
                            vilkar: Vilkårtype.Sats,
                        })}
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
                            <p>Error code: {sendtTilAttesteringStatus.error.code}</p>
                            <p>Melding: {sendtTilAttesteringStatus.error.message}</p>
                        </div>
                    </AlertStripeFeil>
                )}
            </div>
        );
    }

    return <div>Behandlingen er ikke ferdig</div>;
};

export default Vedtak;

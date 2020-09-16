import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React from 'react';
import { Link } from 'react-router-dom';

import {
    Behandling,
    Behandlingsstatus,
    Vilkårsvurdering,
    Vilkårtype,
    tilAttestering,
    VilkårVurderingStatus,
} from '~api/behandlingApi';
import { fetchBrev } from '~api/brevApi';
import { Sak } from '~api/sakApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { mapToVilkårsinformasjon, statusIcon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import FeatureToggles from '~lib/featureToggles';
import * as routes from '~lib/routes.ts';
import { Nullable } from '~lib/types';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';
import { Simulering } from '~pages/saksoversikt/simulering/simulering';
import { SaksbehandlingMenyvalg } from '~pages/saksoversikt/types';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
};

const VilkårsvurderingInfoLinje = (props: { type: Vilkårtype; verdi: Vilkårsvurdering }) => (
    <div className={styles.infolinjeContainer}>
        <div className={styles.infolinje}>
            <span className={styles.statusContainer}>
                <span className={styles.statusIcon}>{statusIcon(props.verdi.status)}</span>
            </span>
            <div>
                <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
                <p>{props.verdi.begrunnelse ? props.verdi.begrunnelse : ''}</p>
            </div>
        </div>
    </div>
);

const VilkårsOppsummering = (props: { behandling: Behandling; sakId: string }) => {
    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {Object.entries(props.behandling.vilkårsvurderinger).map(([k, v]) => (
                <VilkårsvurderingInfoLinje type={k as Vilkårtype} verdi={v} key={k} />
            ))}
        </div>
    );
};

const VilkårsvurderingInfoLinjeV2 = (props: {
    type: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse?: Nullable<string>;
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

const VilkårsOppsummeringV2 = (props: { behandling: Behandling }) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandling.behandlingsinformasjon);

    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {vilkårsinformasjon.map((v, index) => (
                <VilkårsvurderingInfoLinjeV2
                    type={v.vilkårtype}
                    status={v.status}
                    key={index}
                    begrunnelse={v.begrunnelse}
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
        return <div>Behandling er sendt til Attestering</div>;
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
                        {!FeatureToggles.VilkårsvurderingV2 ? (
                            <VilkårsOppsummering behandling={behandling} sakId={sak.id} />
                        ) : (
                            <VilkårsOppsummeringV2 behandling={behandling} />
                        )}
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
                        to={routes.saksoversiktValgtBehandling.createURL({
                            sakId: sak.id,
                            behandlingId: behandlingId,
                            meny: SaksbehandlingMenyvalg.Beregning,
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

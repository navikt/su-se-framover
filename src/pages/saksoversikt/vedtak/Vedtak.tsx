import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import Lenke from 'nav-frontend-lenker';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Behandling, Behandlingsstatus, Vilkårsvurdering, Vilkårtype } from '~api/behandlingApi';
import { fetchBrev } from '~api/brevApi';
import { Sak } from '~api/sakApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { statusIcon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import * as routes from '~lib/routes.ts';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';
import { SaksbehandlingMenyvalg } from '~pages/saksoversikt/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
    behandlingId: string;
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

const VisBeregningDersom = (props: { behandling: Behandling }) => {
    if (props.behandling.status === Behandlingsstatus.AVSLÅTT) {
        return null;
    }
    if (props.behandling.status === Behandlingsstatus.INNVILGET && props.behandling.beregning) {
        return <VisBeregning beregning={props.behandling.beregning} />;
    }
    return <>Det er ikke gjort en beregning</>;
};

const Vedtak = (props: Props) => {
    const { sak, behandlingId } = props;

    const fetchBehandlingStatus = useAppSelector((s) => s.sak.fetchBehandlingStatus);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (RemoteData.isInitial(fetchBehandlingStatus)) {
            dispatch(sakSlice.fetchBehandling({ sakId: sak.id, behandlingId }));
        }
    });
    if (RemoteData.isPending(fetchBehandlingStatus) || RemoteData.isInitial(fetchBehandlingStatus)) {
        return <NavFrontendSpinner />;
    }
    if (RemoteData.isFailure(fetchBehandlingStatus)) {
        return <AlertStripe type="feil">{fetchBehandlingStatus.error.message}</AlertStripe>;
    }
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling) {
        return <div>Fant ikke behandlingsid</div>;
    }
    if (
        behandling.vilkårsvurderinger &&
        (behandling.status === Behandlingsstatus.INNVILGET || behandling.status === Behandlingsstatus.AVSLÅTT)
    ) {
        return (
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {behandling.status === Behandlingsstatus.INNVILGET && (
                            <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>
                        )}
                        {behandling.status === Behandlingsstatus.AVSLÅTT && (
                            <AlertStripeFeil>{behandling.status}</AlertStripeFeil>
                        )}
                    </div>
                    <div>
                        <VilkårsOppsummering behandling={behandling} sakId={sak.id} />
                    </div>
                    <div>
                        <VisBeregningDersom behandling={behandling} />
                    </div>
                    <div>
                        <Innholdstittel>Vis brev kladd</Innholdstittel>
                        <Lenke
                            href={'#'}
                            onClick={() =>
                                fetchBrev(sak.id, sak.behandlinger[0].id).then((res) => {
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
                        to={routes.saksoversikt.createURL({
                            sakId: sak.id,
                            behandlingId: behandlingId,
                            meny: SaksbehandlingMenyvalg.Beregning,
                        })}
                        className="knapp"
                    >
                        Tilbake
                    </Link>
                </div>
            </div>
        );
    }
    return <div>Behandlingen er ikke ferdig</div>;
};

export default Vedtak;

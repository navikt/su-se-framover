import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React from 'react';
import { Link } from 'react-router-dom';

import { Behandling, Behandlingsstatus, Vilkårsvurdering, Vilkårtype, sendTilAttestering } from '~api/behandlingApi';
import { fetchBrev } from '~api/brevApi';
import { Sak } from '~api/sakApi';
import { statusIcon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import * as routes from '~lib/routes.ts';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';
import { Simulering } from '~pages/saksoversikt/simulering/simulering';
import { SaksbehandlingMenyvalg } from '~pages/saksoversikt/types';

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

const VisDersomSimulert = (props: { sak: Sak; behandling: Behandling }) => {
    if (props.behandling.status === Behandlingsstatus.AVSLÅTT) {
        return null;
    }
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
    const { sak } = props;
    const { behandlingId } = routes.useRouteParams<typeof routes.saksoversiktValgtBehandling>();

    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling) {
        return <AlertStripe type="feil">Fant ikke behandlingsid</AlertStripe>;
    }
    if (
        behandling.vilkårsvurderinger &&
        (behandling.status === Behandlingsstatus.SIMULERT || behandling.status === Behandlingsstatus.AVSLÅTT)
    ) {
        return (
            <div>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {behandling.status === Behandlingsstatus.SIMULERT && (
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
                    <Hovedknapp
                        onClick={() => {
                            sendTilAttestering({
                                sakId: sak.id,
                                behandlingId: behandlingId,
                            });
                        }}
                        htmlType="button"
                    >
                        Send til attestering
                    </Hovedknapp>
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
                </div>
            </div>
        );
    }
    return <div>Behandlingen er ikke ferdig</div>;
};

export default Vedtak;

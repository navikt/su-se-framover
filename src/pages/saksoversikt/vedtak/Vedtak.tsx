import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React from 'react';
import { Link } from 'react-router-dom';

import { Behandling, Behandlingsstatus, Vilkårsvurdering, Vilkårtype } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import {
    oneVilkåringsvurderingIsNotOk,
    statusIcon,
    vilkårsvurderingIsValid,
    vilkårTittelFormatted,
} from '~features/saksoversikt/utils';
import * as routes from '~lib/routes.ts';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';
import { SaksbehandlingMenyvalg } from '~pages/saksoversikt/types';

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

const Vedtak = (props: Props) => {
    const { sak, behandlingId } = props;
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling) {
        return <div>Fant ikke behandlingsid</div>;
    }
    if (vilkårsvurderingIsValid(behandling.vilkårsvurderinger) && behandling.beregning) {
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
                        <VisBeregning beregning={behandling.beregning} />
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
    if (oneVilkåringsvurderingIsNotOk(behandling.vilkårsvurderinger)) {
        return <div>Et eller fler vilkår var ikke OK</div>;
    }
    return <div>Behandlingen er ikke ferdig</div>;
};
export default Vedtak;

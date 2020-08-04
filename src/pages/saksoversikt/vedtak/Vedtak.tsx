import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Sidetittel } from 'nav-frontend-typografi';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React from 'react';

import { Behandling, Vilkårsvurdering, Vilkårtype, Behandlingsstatus } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import {
    oneVilkåringsvurderingIsNotOk,
    vilkårsvurderingIsValid,
    vilkårTittelFormatted,
    statusIcon,
} from '~features/saksoversikt/utils';
import VisBeregning from '~pages/saksoversikt/beregning/VisBeregning';

import styles from './vedtak.module.less';

type Props = {
    sak: Sak;
    behandlingId: string;
};

const VilkårsvurderingInfoLinje = (props: { type: Vilkårtype; verdi: Vilkårsvurdering }) => (
    <div className={styles.infolinjeContainer}>
        <div className={styles.infolinje}>
            <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
            <span className={styles.statusContainer}>
                <span className={styles.statusIcon}>{statusIcon(props.verdi.status)}</span>
            </span>
        </div>
        <p>{props.verdi.begrunnelse ? props.verdi.begrunnelse : ''}</p>
    </div>
);

const VilkårsOppsummering = (props: { behandling: Behandling; sakId: string }) => {
    return (
        <div>
            <Innholdstittel>Vilkårsvurderinger</Innholdstittel>
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
            <div className={styles.vedtakContainer}>
                <div className={styles.marginBottomContainer}>
                    <Sidetittel>Vedtak</Sidetittel>
                </div>
                <div className={styles.marginBottomContainer}>
                    <VilkårsOppsummering behandling={behandling} sakId={sak.id} />
                </div>
                <div className={styles.marginBottomContainer}>
                    <VisBeregning beregning={behandling.beregning} />
                </div>
                <div className={styles.marginBottomContainer}>Et fint brev her :)</div>

                <div className={styles.marginBottomContainer}>
                    {behandling.status === Behandlingsstatus.INNVILGET && (
                        <AlertStripeSuksess>{behandling.status}</AlertStripeSuksess>
                    )}
                    {behandling.status === Behandlingsstatus.AVSLÅTT && (
                        <AlertStripeFeil>{behandling.status}</AlertStripeFeil>
                    )}
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

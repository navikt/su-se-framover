import { Innholdstittel, Systemtittel, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import VisBeregningOgSimulering from '~components/beregningOgSimulering/BeregningOgSimulering';
import VilkårsOppsummering from '~components/oppsummering/vilkårsOppsummering/VilkårsOppsummering';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { Behandling, Behandlingsperiode } from '~types/Behandling';
import { Periode } from '~types/Periode';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './søknadsbehandling-nb';
import SøknadsbehandlingHeader from './SøknadsbehandlingHeader';
import styles from './søknadsbehandlingoppsummering.module.less';

interface Props {
    sak: Sak;
    behandling: Behandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}

const Søknadsbehandlingoppsummering = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const periode = props.behandling.stønadsperiode ? getPeriode(props.behandling.stønadsperiode) : null;

    return (
        <div>
            <Innholdstittel className={styles.tittel}>{formatMessage('tittel')}</Innholdstittel>
            <SøknadsbehandlingHeader
                sakId={props.sak.id}
                behandling={props.behandling}
                vedtakForBehandling={props.vedtakForBehandling}
                medBrevutkastknapp={props.medBrevutkastknapp}
            />
            <div className={styles.virkningstidspunkt}>
                <Systemtittel className={styles.tittel}>
                    {`${formatMessage('virkningstidspunkt.tittel')}:
                    ${
                        periode ? DateUtils.formatPeriode(periode) : formatMessage('virkningstidspunkt.periode.mangler')
                    }`}
                </Systemtittel>
                {props.behandling.stønadsperiode?.begrunnelse ? (
                    <div>
                        <Undertittel>{formatMessage('virkningstidspunkt.begrunnelse')}</Undertittel>
                        <p>{props.behandling.stønadsperiode?.begrunnelse}</p>
                    </div>
                ) : (
                    <></>
                )}
            </div>
            <VilkårsOppsummering
                grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                behandlingstatus={props.behandling.status}
                søknadInnhold={props.behandling.søknad.søknadInnhold}
                behandlingsinformasjon={props.behandling.behandlingsinformasjon}
            />
            {props.behandling.beregning ? (
                <VisBeregningOgSimulering behandling={props.behandling} />
            ) : (
                formatMessage('feilmelding.ikkeGjortEnBeregning')
            )}
        </div>
    );
};

function getPeriode(behandlingsperiode: Behandlingsperiode): Nullable<Periode<string>> {
    const fraOgMed = behandlingsperiode.periode.fraOgMed;
    const tilOgMed = behandlingsperiode.periode.tilOgMed;
    if (fraOgMed === null || tilOgMed === null) return null;

    return { fraOgMed: fraOgMed, tilOgMed: tilOgMed };
}

export default Søknadsbehandlingoppsummering;

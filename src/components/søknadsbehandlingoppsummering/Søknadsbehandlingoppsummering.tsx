import { Heading, Panel } from '@navikt/ds-react';
import * as React from 'react';

import VisBeregningOgSimulering from '~components/beregningOgSimulering/BeregningOgSimulering';
import { SatsVilkårsblokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/SatsFaktablokk';
import VilkårsOppsummering from '~components/oppsummering/vilkårsOppsummering/VilkårsOppsummering';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { Behandling, Behandlingsperiode } from '~types/Behandling';
import { Periode } from '~types/Periode';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';
import * as DateUtils from '~utils/date/dateUtils';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import messages from './søknadsbehandling-nb';
import SøknadsbehandlingHeader from './SøknadsbehandlingHeader';
import styles from './søknadsbehandlingoppsummering.module.less';

interface Props {
    sak: Sak;
    behandling: Behandling;
    tittel?: React.ReactNode;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}

const Søknadsbehandlingoppsummering = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const periode = props.behandling.stønadsperiode ? getPeriode(props.behandling.stønadsperiode) : null;

    return (
        <div>
            {props.tittel && typeof props.tittel !== 'string' ? (
                props.tittel
            ) : (
                <Heading level="1" size="2xlarge" spacing>
                    {props.tittel ?? formatMessage('tittel')}
                </Heading>
            )}
            <SøknadsbehandlingHeader
                sakId={props.sak.id}
                behandling={props.behandling}
                vedtakForBehandling={props.vedtakForBehandling}
                medBrevutkastknapp={props.medBrevutkastknapp}
            />
            <div className={styles.virkningstidspunkt}>
                <Heading level="2" size="large" spacing>
                    {`${formatMessage('virkningstidspunkt.tittel')}:
                    ${
                        periode ? DateUtils.formatPeriode(periode) : formatMessage('virkningstidspunkt.periode.mangler')
                    }`}
                </Heading>
                {props.behandling.stønadsperiode?.begrunnelse && (
                    <div>
                        <Heading level="3" size="medium" spacing>
                            {formatMessage('virkningstidspunkt.begrunnelse')}
                        </Heading>
                        <p>{props.behandling.stønadsperiode?.begrunnelse}</p>
                    </div>
                )}
            </div>
            <VilkårsOppsummering
                grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                søknadInnhold={props.behandling.søknad.søknadInnhold}
                behandlingsinformasjon={props.behandling.behandlingsinformasjon}
            />
            {props.behandling.beregning ? (
                <div>
                    <SatsVilkårsblokk
                        bosituasjon={hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger)}
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                    />
                    <Panel border>
                        <VisBeregningOgSimulering behandling={props.behandling} />
                    </Panel>
                </div>
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

import { Heading, Label, Panel } from '@navikt/ds-react';
import * as React from 'react';

import VisBeregningOgSimulering from '~src/components/beregningOgSimulering/BeregningOgSimulering';
import { SatsVilkårsblokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/SatsFaktablokk';
import VilkårsOppsummering from '~src/components/oppsummering/vilkårsOppsummering/VilkårsOppsummering';
import { useI18n } from '~src/lib/i18n';
import { Sak } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vedtak } from '~src/types/Vedtak';
import * as DateUtils from '~src/utils/date/dateUtils';

import SidestiltOppsummeringAvVilkårOgGrunnlag from '../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';

import messages from './søknadsbehandling-nb';
import SøknadsbehandlingHeader from './SøknadsbehandlingHeader';
import * as styles from './søknadsbehandlingoppsummering.module.less';

interface Props {
    sak: Sak;
    behandling: Søknadsbehandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}

const Søknadsbehandlingoppsummering = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const periode = props.behandling.stønadsperiode?.periode;

    const visVilkårSomAccordions = true;

    return (
        <div>
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
            </div>

            {visVilkårSomAccordions ? (
                <div className={styles.sidestiltOppsummeringContainer}>
                    <SidestiltOppsummeringAvVilkårOgGrunnlag
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                    />
                </div>
            ) : (
                <>
                    <VilkårsOppsummering
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                    />
                    <SatsVilkårsblokk
                        bosituasjon={props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                    />
                </>
            )}

            {props.behandling.beregning ? (
                <Panel border>
                    <VisBeregningOgSimulering behandling={props.behandling} />
                </Panel>
            ) : (
                <Label>{formatMessage('feilmelding.ikkeGjortEnBeregning')}</Label>
            )}
        </div>
    );
};

export default Søknadsbehandlingoppsummering;

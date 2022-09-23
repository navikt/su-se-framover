import { Heading, Label, Panel } from '@navikt/ds-react';
import * as React from 'react';

import VisBeregningOgSimulering from '~src/components/beregningOgSimulering/BeregningOgSimulering';
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

            <div className={styles.sidestiltOppsummeringContainer}>
                <SidestiltOppsummeringAvVilkårOgGrunnlag
                    grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                    visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                />
            </div>

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

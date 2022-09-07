import { Alert } from '@navikt/ds-react';
import React from 'react';

import OppsummeringAvBosituasjongrunnlag from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon';
import { DelerBoligMed } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import { delerBoligMedFormatted } from '../../../../../utils/søknadsbehandling/søknadsbehandlingUtils';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const SatsFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    const fakta = [];

    if (props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER) {
        fakta.push({
            tittel: formatMessage('sats.ektemakeEllerSamboerUførFlyktning'),
            verdi: props.søknadInnhold.boforhold.ektefellePartnerSamboer
                ? formatMessage(
                      props.søknadInnhold.boforhold.ektefellePartnerSamboer.erUførFlyktning
                          ? 'fraSøknad.ja'
                          : 'fraSøknad.nei'
                  )
                : '-',
        });
    }

    if (
        props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.ANNEN_VOKSEN ||
        props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
    ) {
        fakta.push({
            tittel: formatMessage('sats.hvemDelerSøkerBoligMed'),
            verdi: delerBoligMedFormatted(props.søknadInnhold.boforhold.delerBoligMed),
        });
    }

    if (!props.søknadInnhold.boforhold.delerBoligMedVoksne) {
        fakta.push({
            tittel: formatMessage('sats.hvemDelerSøkerBoligMed'),
            verdi: formatMessage('sats.hvemDelerSøkerBoligMed.ingen'),
        });
    }

    return <Faktablokk tittel={formatMessage('display.fraSøknad')} fakta={fakta} />;
};

export const SatsVilkårsblokk = (props: { bosituasjon: Bosituasjon[]; søknadInnhold: SøknadInnhold }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(Vilkårtype.Sats)}
            søknadfaktablokk={<SatsFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.bosituasjon.length === 0 ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvBosituasjongrunnlag bosituasjon={props.bosituasjon} />
                )
            }
        />
    );
};

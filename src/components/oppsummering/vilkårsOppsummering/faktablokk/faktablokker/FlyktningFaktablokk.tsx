import { Alert } from '@navikt/ds-react';
import React from 'react';

import OppsummeringAvFlyktningvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFlyktning';
import { useI18n } from '~src/lib/i18n';
import søknadMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { VilkårtypeUføre, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/flyktning/flyktning-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

export const FlyktningFaktablokk = (props: { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...søknadMessages } });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('flyktning.label'),
                    verdi: props.søknadInnhold.flyktningsstatus.registrertFlyktning
                        ? formatMessage('fraSøknad.ja')
                        : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};

export const FlyktningVilkårsblokk = (props: {
    søknadInnhold: SøknadInnholdUføre;
    flyktningVilkår: GrunnlagsdataOgVilkårsvurderinger['flyktning'];
    status: VilkårVurderingStatus;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...saksbehandlingMessages } });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeUføre.Flyktning)}
            søknadfaktablokk={<FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.flyktningVilkår?.resultat === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvFlyktningvilkår flyktning={props.flyktningVilkår} visesIVedtak />
                )
            }
            status={props.status}
        />
    );
};

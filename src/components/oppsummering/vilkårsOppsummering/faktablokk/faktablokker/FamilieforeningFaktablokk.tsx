import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import saksbehandlingMessages from '~src/pages/saksbehandling/steg/familieforening/familieforening-nb';
import søknadMessages from '~src/pages/søknad/steg/oppholdstillatelse/oppholdstillatelse-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';
import { Vilkårstatus } from '~src/types/Vilkår';
import { VilkårtypeAlder, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

export const FamilieforeningBlokk = (props: { familieforening: Nullable<boolean> }) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('familieforening.label'),
                    verdi: props.familieforening ? formatMessage('fraSøknad.ja') : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};

interface Props {
    søknadInnhold: SøknadInnholdAlder;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger['familiegjenforening'];
    status: VilkårVurderingStatus;
}

export const FamilieforeningVilkårsblokk = (props: Props) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    const vurdering = props.grunnlagsdataOgVilkårsvurderinger?.vurderinger[0] ?? null;

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeAlder.Familieforening)}
            status={props.status}
            søknadfaktablokk={
                <FamilieforeningBlokk familieforening={props.søknadInnhold.oppholdstillatelseAlder.familieforening} />
            }
            saksbehandlingfaktablokk={
                vurdering === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('label.familieforening'),
                                verdi:
                                    vurdering.resultat === Vilkårstatus.VilkårOppfylt
                                        ? formatMessage('fraSøknad.nei')
                                        : vurdering.resultat === Vilkårstatus.VilkårIkkeOppfylt
                                        ? formatMessage('fraSøknad.ja')
                                        : formatMessage('fraSøknad.uavklart'),
                            },
                        ]}
                    />
                )
            }
        />
    );
};

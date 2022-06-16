import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import saksbehandlingMessages from '~src/pages/saksbehandling/steg/familieforening/familieforening-nb';
import søknadMessages from '~src/pages/søknad/steg/oppholdstillatelse/oppholdstillatelse-nb';
import { Behandlingsinformasjon, Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { SøknadInnholdAlder } from '~src/types/Søknad';
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
    behandlingsinformasjon: Behandlingsinformasjon['familieforening'];
    status: VilkårVurderingStatus;
}

export const FamilieforeningVilkårsblokk = (props: Props) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeAlder.Familieforening)}
            status={props.status}
            søknadfaktablokk={
                <FamilieforeningBlokk familieforening={props.søknadInnhold.oppholdstillatelseAlder.familieforening} />
            }
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('label.familieforening'),
                                verdi:
                                    props.behandlingsinformasjon.status === Vilkårstatus.VilkårOppfylt
                                        ? formatMessage('fraSøknad.nei')
                                        : props.behandlingsinformasjon.status === Vilkårstatus.VilkårIkkeOppfylt
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

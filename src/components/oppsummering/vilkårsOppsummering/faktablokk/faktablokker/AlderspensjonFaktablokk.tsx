import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import søknadMessages from '~src/pages/søknad/steg/alderspensjon/alderspensjon-nb';
import { Behandlingsinformasjon, Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { SøknadInnholdAlder } from '~src/types/Søknad';
import { VilkårtypeAlder, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/institusjonsopphold/institusjonsopphold-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

export const AlderspensjonBlokk = (props: { harSøktAlderspensjon: SøknadInnholdAlder['harSøktAlderspensjon'] }) => {
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
                    tittel: formatMessage('alderspensjon.label'),
                    verdi: props.harSøktAlderspensjon.harSøktAlderspensjon
                        ? formatMessage('fraSøknad.ja')
                        : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};

interface Props {
    søknadInnhold: SøknadInnholdAlder;
    behandlingsinformasjon: Behandlingsinformasjon['alderspensjon'];
    status: VilkårVurderingStatus;
}

export const AlderspensjonVilkårsblokk = (props: Props) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeAlder.Alderspensjon)}
            status={props.status}
            søknadfaktablokk={<AlderspensjonBlokk harSøktAlderspensjon={props.søknadInnhold.harSøktAlderspensjon} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('radio.institusjonsoppholdFørerTilAvslag.legend'),
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

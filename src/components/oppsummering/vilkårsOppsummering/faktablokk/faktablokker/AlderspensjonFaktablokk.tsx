import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import saksbehandlingMessages from '~src/pages/saksbehandling/steg/alderspensjon/alderspensjon-nb';
import søknadMessages from '~src/pages/søknad/steg/alderspensjon/alderspensjon-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnholdAlder } from '~src/types/Søknad';
import { VilkårtypeAlder, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

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
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger['pensjon'];
    status: VilkårVurderingStatus;
}

export const AlderspensjonVilkårsblokk = (props: Props) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    const vurdering = props.grunnlagsdataOgVilkårsvurderinger?.vurderinger[0]?.pensjonsopplysninger;
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeAlder.Alderspensjon)}
            status={props.status}
            søknadfaktablokk={<AlderspensjonBlokk harSøktAlderspensjon={props.søknadInnhold.harSøktAlderspensjon} />}
            saksbehandlingfaktablokk={
                props.grunnlagsdataOgVilkårsvurderinger === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('label.folketrygd'),
                                verdi: formatMessage(vurdering?.folketrygd ?? 'fraSøknad.uavklart'),
                            },
                            {
                                tittel: formatMessage('label.andreNorske'),
                                verdi: formatMessage(vurdering?.andreNorske ?? 'fraSøknad.uavklart'),
                            },
                            {
                                tittel: formatMessage('label.utenlandske'),
                                verdi: formatMessage(vurdering?.utenlandske ?? 'fraSøknad.uavklart'),
                            },
                        ]}
                    />
                )
            }
        />
    );
};

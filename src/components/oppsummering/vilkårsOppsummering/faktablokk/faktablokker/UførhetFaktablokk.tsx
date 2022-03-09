import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export interface UføreVilkårsblokkProps {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}

export const UførhetFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('uførhet.vedtakOmUføretrygd'),
                    verdi: props.søknadInnhold.uførevedtak.harUførevedtak
                        ? formatMessage('fraSøknad.ja')
                        : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};

export const UførhetVilkårsblokk = (props: UføreVilkårsblokkProps) => {
    const { formatMessage } = useI18n({ messages });

    const { uføre } = props.grunnlagsdataOgVilkårsvurderinger;
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<UførhetFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                uføre === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('radio.uførhet.legend'),
                                verdi:
                                    uføre.resultat === UføreResultat.VilkårOppfylt
                                        ? formatMessage('fraSøknad.ja')
                                        : uføre.resultat === UføreResultat.VilkårIkkeOppfylt
                                        ? formatMessage('fraSøknad.nei')
                                        : formatMessage('radio.label.uføresakTilBehandling'),
                            },
                            ...(uføre.resultat === UføreResultat.VilkårOppfylt
                                ? [
                                      FaktaSpacing,
                                      {
                                          tittel: formatMessage('input.label.uføregrad'),
                                          verdi: uføre.vurderinger[0]?.grunnlag?.uføregrad?.toString() ?? '-',
                                      },
                                      {
                                          tittel: formatMessage('input.label.forventetInntekt'),
                                          verdi: uføre.vurderinger[0].grunnlag?.forventetInntekt?.toString() ?? '-',
                                      },
                                  ]
                                : []),
                        ]}
                    />
                )
            }
            begrunnelse={props.info.begrunnelse}
        />
    );
};

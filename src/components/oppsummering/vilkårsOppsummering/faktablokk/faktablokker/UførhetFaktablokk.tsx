import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/uførhet/uførhet-nb';
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
    const { intl } = useI18n({
        messages,
    });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: 'uførhet.vedtakOmUføretrygd' }),
                    verdi: props.søknadInnhold.uførevedtak.harUførevedtak
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export const UførhetVilkårsblokk = (props: UføreVilkårsblokkProps) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    const saksbehandlingMessage = (s: keyof typeof saksbehandlingMessages) =>
        intl.formatMessage({
            id: s,
        });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<UførhetFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.grunnlagsdataOgVilkårsvurderinger.uføre === null ? (
                    <Alert variant="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</Alert>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: saksbehandlingMessage('radio.uførhet.legend'),
                                verdi:
                                    props.grunnlagsdataOgVilkårsvurderinger.uføre.resultat ===
                                    UføreResultat.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.grunnlagsdataOgVilkårsvurderinger.uføre.resultat ===
                                          UføreResultat.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : intl.formatMessage({ id: 'radio.label.uføresakTilBehandling' }),
                            },
                            ...(props.grunnlagsdataOgVilkårsvurderinger.uføre.resultat === UføreResultat.VilkårOppfylt
                                ? [
                                      FaktaSpacing,
                                      {
                                          tittel: saksbehandlingMessage('input.label.uføregrad'),
                                          verdi:
                                              props.grunnlagsdataOgVilkårsvurderinger.uføre.vurderinger[0].grunnlag?.uføregrad?.toString() ??
                                              '-',
                                      },
                                      {
                                          tittel: saksbehandlingMessage('input.label.forventetInntekt'),
                                          verdi:
                                              props.grunnlagsdataOgVilkårsvurderinger.uføre.vurderinger[0].grunnlag?.forventetInntekt?.toString() ??
                                              '-',
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

import AlertStripe from 'nav-frontend-alertstriper';
import React from 'react';

import { useI18n } from '~lib/hooks';
import { UførhetStatus } from '~types/Behandlingsinformasjon';
import { vilkårTittelFormatted } from '~Utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/uførhet/uførhet-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

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

export const UførhetVilkårsblokk = (props: VilkårsblokkProps<'uførhet'>) => {
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
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: saksbehandlingMessage('radio.uførhet.legend'),
                                verdi:
                                    props.behandlingsinformasjon.status === UførhetStatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status === UførhetStatus.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : intl.formatMessage({ id: 'radio.label.uføresakTilBehandling' }),
                            },
                            ...(props.behandlingsinformasjon.status === UførhetStatus.VilkårOppfylt
                                ? [
                                      FaktaSpacing,
                                      {
                                          tittel: saksbehandlingMessage('input.label.uføregrad'),
                                          verdi: props.behandlingsinformasjon.uføregrad?.toString() ?? '-',
                                      },
                                      {
                                          tittel: saksbehandlingMessage('input.label.forventetInntekt'),
                                          verdi: props.behandlingsinformasjon.forventetInntekt?.toString() ?? '-',
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

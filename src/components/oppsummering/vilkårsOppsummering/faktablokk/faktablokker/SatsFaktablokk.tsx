import React from 'react';

import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { DelerBoligMed } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Sats } from '~types/Sats';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/steg/sats/sats-nb';
import { delerBoligMedFormatted } from '../../../../../pages/saksbehandling/steg/sharedUtils';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const SatsFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({ messages });

    const fakta = [];

    if (props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER) {
        fakta.push({
            tittel: intl.formatMessage({
                id: 'sats.ektemakeEllerSamboerUførFlyktning',
            }),
            verdi: props.søknadInnhold.boforhold.ektefellePartnerSamboer
                ? intl.formatMessage({
                      id: props.søknadInnhold.boforhold.ektefellePartnerSamboer.erUførFlyktning
                          ? 'fraSøknad.ja'
                          : 'fraSøknad.nei',
                  })
                : '-',
        });
    }

    if (
        props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.ANNEN_VOKSEN ||
        props.søknadInnhold.boforhold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
    ) {
        fakta.push({
            tittel: intl.formatMessage({
                id: 'sats.hvemDelerSøkerBoligMed',
            }),
            verdi: delerBoligMedFormatted(props.søknadInnhold.boforhold.delerBoligMed),
        });
    }

    if (!props.søknadInnhold.boforhold.delerBoligMedVoksne) {
        fakta.push({
            tittel: intl.formatMessage({
                id: 'sats.hvemDelerSøkerBoligMed',
            }),
            verdi: intl.formatMessage({
                id: 'sats.hvemDelerSøkerBoligMed.ingen',
            }),
        });
    }

    return (
        <Faktablokk
            tittel={intl.formatMessage({
                id: 'display.fraSøknad',
            })}
            fakta={fakta}
        />
    );
};

export const SatsVilkårsblokk = (props: { bosituasjon: Bosituasjon; søknadInnhold: SøknadInnhold }) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(Vilkårtype.Sats)}
            søknadfaktablokk={<SatsFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                <Faktablokk
                    tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                    fakta={[
                        ...(props.bosituasjon.fnr
                            ? [
                                  {
                                      tittel: intl.formatMessage({
                                          id: keyOf<typeof saksbehandlingMessages>(
                                              'radio.ektemakeEllerSamboerUførFlyktning.legend'
                                          ),
                                      }),
                                      verdi: props.bosituasjon?.ektemakeEllerSamboerUførFlyktning
                                          ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                          : intl.formatMessage({ id: 'fraSøknad.nei' }),
                                  },
                              ]
                            : []),
                        {
                            tittel: intl.formatMessage({ id: 'bosituasjon.vurderingAvSats' }),
                            verdi:
                                props.bosituasjon.sats === Sats.Høy
                                    ? intl.formatMessage({ id: 'bosituasjon.sats.høy' })
                                    : intl.formatMessage({ id: 'bosituasjon.sats.ordinær' }),
                        },
                    ]}
                />
            }
            begrunnelse={props.bosituasjon?.begrunnelse ?? ''}
        />
    );
};

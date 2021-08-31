import AlertStripe from 'nav-frontend-alertstriper';
import React from 'react';

import { GrunnForPapirinnsending } from '~features/søknad/types';
import { useI18n } from '~lib/i18n';
import { PersonligOppmøteStatus } from '~types/Behandlingsinformasjon';
import { Søknadstype } from '~types/Søknad';
import { vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/personlig-oppmøte/personligOppmøte-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const PersonligOppmøteFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={
                props.søknadInnhold.forNav.type === Søknadstype.DigitalSøknad
                    ? [
                          {
                              tittel: intl.formatMessage({ id: 'personligOppmøte.hvemHarMøtt' }),
                              verdi:
                                  props.søknadInnhold.forNav.harFullmektigEllerVerge === null
                                      ? intl.formatMessage({ id: 'personligOppmøte.personligOppmøte' })
                                      : props.søknadInnhold.forNav.harFullmektigEllerVerge,
                          },
                      ]
                    : [
                          {
                              tittel: intl.formatMessage({
                                  id: 'personligOppmøte.papirsøknad.grunnForPapirinnsending',
                              }),
                              verdi:
                                  props.søknadInnhold.forNav.grunnForPapirinnsending ===
                                  GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker
                                      ? intl.formatMessage({
                                            id: 'personligOppmøte.papirsøknad.vergeSøktPåVegneAvBruker',
                                        })
                                      : props.søknadInnhold.forNav.grunnForPapirinnsending ===
                                        GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt
                                      ? intl.formatMessage({
                                            id: 'personligOppmøte.papirsøknad.midlertidigUnntakForOppmøteplikt',
                                        })
                                      : props.søknadInnhold.forNav.annenGrunn ?? '-',
                          },
                      ]
            }
        />
    );
};

export const PersonligOppmøteVilkårsblokk = (props: VilkårsblokkProps<'personligOppmøte'>) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    const saksbehandlingMessage = (s: keyof typeof saksbehandlingMessages) => s;

    const getStatusText = (status: PersonligOppmøteStatus) => {
        switch (status) {
            case PersonligOppmøteStatus.MøttPersonlig:
                return '';
            case PersonligOppmøteStatus.IkkeMøttMenVerge:
                return intl.formatMessage({
                    id: saksbehandlingMessage('radio.personligOppmøte.grunn.oppnevntVergeSøktPerPost'),
                });
            case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
                return intl.formatMessage({
                    id: saksbehandlingMessage('radio.personligOppmøte.grunn.sykMedLegeerklæringOgFullmakt'),
                });
            case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
                return intl.formatMessage({
                    id: saksbehandlingMessage('radio.personligOppmøte.grunn.kortvarigSykMedLegeerklæring'),
                });
            case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
                return intl.formatMessage({
                    id: saksbehandlingMessage('radio.personligOppmøte.grunn.midlertidigUnntakFraOppmøteplikt'),
                });
            case PersonligOppmøteStatus.IkkeMøttPersonlig:
                return '';
            case PersonligOppmøteStatus.Uavklart:
                return '';
        }
    };

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<PersonligOppmøteFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: saksbehandlingMessage('radio.personligOppmøte.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status === PersonligOppmøteStatus.MøttPersonlig
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status === PersonligOppmøteStatus.Uavklart
                                        ? intl.formatMessage({ id: 'fraSøknad.uavklart' })
                                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                            },
                            ...(props.behandlingsinformasjon.status !== PersonligOppmøteStatus.MøttPersonlig &&
                            props.behandlingsinformasjon.status !== PersonligOppmøteStatus.Uavklart
                                ? [
                                      {
                                          tittel: intl.formatMessage({
                                              id: saksbehandlingMessage('radio.personligOppmøte.grunn.legend'),
                                          }),
                                          verdi: getStatusText(props.behandlingsinformasjon.status),
                                      },
                                  ]
                                : []),
                        ]}
                    />
                )
            }
            status={props.info.status}
            begrunnelse={props.info.begrunnelse}
        />
    );
};

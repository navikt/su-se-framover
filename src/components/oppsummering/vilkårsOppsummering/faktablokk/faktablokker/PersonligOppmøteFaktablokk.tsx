import { Alert } from '@navikt/ds-react';
import React from 'react';

import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { ManglendeOppmøteGrunn } from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/types';
import { PersonligOppmøteStatus } from '~src/types/Behandlingsinformasjon';
import { Søknadstype } from '~src/types/Søknad';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/personlig-oppmøte/personligOppmøte-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const PersonligOppmøteFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={
                props.søknadInnhold.forNav.type === Søknadstype.DigitalSøknad
                    ? [
                          {
                              tittel: formatMessage('personligOppmøte.hvemHarMøtt'),
                              verdi:
                                  props.søknadInnhold.forNav.harFullmektigEllerVerge === null
                                      ? formatMessage('personligOppmøte.personligOppmøte')
                                      : props.søknadInnhold.forNav.harFullmektigEllerVerge,
                          },
                      ]
                    : [
                          {
                              tittel: formatMessage('personligOppmøte.papirsøknad.grunnForPapirinnsending'),
                              verdi:
                                  props.søknadInnhold.forNav.grunnForPapirinnsending ===
                                  GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker
                                      ? formatMessage('personligOppmøte.papirsøknad.vergeSøktPåVegneAvBruker')
                                      : props.søknadInnhold.forNav.grunnForPapirinnsending ===
                                        GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt
                                      ? formatMessage('personligOppmøte.papirsøknad.midlertidigUnntakForOppmøteplikt')
                                      : props.søknadInnhold.forNav.annenGrunn ?? '-',
                          },
                      ]
            }
        />
    );
};

export const PersonligOppmøteVilkårsblokk = (props: VilkårsblokkProps<'personligOppmøte'>) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    const getStatusText = (status: PersonligOppmøteStatus) => {
        switch (status) {
            case PersonligOppmøteStatus.MøttPersonlig:
                return '';
            case PersonligOppmøteStatus.IkkeMøttMenVerge:
                return formatMessage(ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost);
            case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
                return formatMessage(ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt);
            case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
                return formatMessage(ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring);
            case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
                return formatMessage(ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt);
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
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('radio.personligOppmøte.legend'),
                                verdi:
                                    props.behandlingsinformasjon.status === PersonligOppmøteStatus.MøttPersonlig
                                        ? formatMessage('fraSøknad.ja')
                                        : props.behandlingsinformasjon.status === PersonligOppmøteStatus.Uavklart
                                        ? formatMessage('fraSøknad.uavklart')
                                        : formatMessage('fraSøknad.nei'),
                            },
                            ...(props.behandlingsinformasjon.status !== PersonligOppmøteStatus.MøttPersonlig &&
                            props.behandlingsinformasjon.status !== PersonligOppmøteStatus.Uavklart
                                ? [
                                      {
                                          tittel: formatMessage('radio.personligOppmøte.grunn.legend'),
                                          verdi: getStatusText(props.behandlingsinformasjon.status),
                                      },
                                  ]
                                : []),
                        ]}
                    />
                )
            }
            status={props.info.status}
        />
    );
};

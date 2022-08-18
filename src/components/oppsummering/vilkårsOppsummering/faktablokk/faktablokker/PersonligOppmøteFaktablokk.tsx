import { Alert } from '@navikt/ds-react';
import React from 'react';

import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { personligOppmøteÅrsakTekster } from '~src/typeMappinger/PersonligOppmøteÅrsak';
import {
    PersonligOppmøteVilkår,
    PersonligOppmøteÅrsak,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { SøknadInnhold, Søknadstype } from '~src/types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/personlig-oppmøte/personligOppmøte-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

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

export const PersonligOppmøteVilkårsblokk = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    personligOppmøte: Nullable<PersonligOppmøteVilkår>;
}) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
            ...personligOppmøteÅrsakTekster,
        },
    });

    const vurderingsperiode = props.personligOppmøte?.vurderinger[0] ?? null;

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<PersonligOppmøteFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                vurderingsperiode === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('radio.personligOppmøte.legend'),
                                verdi:
                                    vurderingsperiode.vurdering === PersonligOppmøteÅrsak.MøttPersonlig
                                        ? formatMessage('fraSøknad.ja')
                                        : vurderingsperiode.vurdering === PersonligOppmøteÅrsak.Uavklart
                                        ? formatMessage('fraSøknad.uavklart')
                                        : formatMessage('fraSøknad.nei'),
                            },
                            ...(vurderingsperiode.vurdering !== PersonligOppmøteÅrsak.MøttPersonlig &&
                            vurderingsperiode.vurdering !== PersonligOppmøteÅrsak.Uavklart
                                ? [
                                      {
                                          tittel: formatMessage('radio.personligOppmøte.grunn.legend'),
                                          verdi: formatMessage(vurderingsperiode.vurdering),
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

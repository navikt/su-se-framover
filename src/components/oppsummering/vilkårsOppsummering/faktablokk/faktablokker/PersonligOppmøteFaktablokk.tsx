import { Alert } from '@navikt/ds-react';
import React from 'react';

import OppsummeringAvPersonligoppmøtevilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { PersonligOppmøteVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { SøknadInnhold, Søknadstype } from '~src/types/Søknadinnhold';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

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
    const { formatMessage } = useI18n({ messages });

    const vurderingsperiode = props.personligOppmøte?.vurderinger[0] ?? null;

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<PersonligOppmøteFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                vurderingsperiode === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvPersonligoppmøtevilkår personligoppmøte={props.personligOppmøte} visesIVedtak />
                )
            }
            status={props.info.status}
        />
    );
};

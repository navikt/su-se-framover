import React from 'react';

import { GrunnForPapirinnsending } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { Søknadstype } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const PersonligOppmøteFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            brukUndertittel={props.brukUndertittel}
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

export default PersonligOppmøteFaktablokk;

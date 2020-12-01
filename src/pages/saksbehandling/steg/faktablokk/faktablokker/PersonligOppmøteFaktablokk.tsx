import React from 'react';

import { GrunnForPapirinnsending } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { SøknadInnhold, Søknadstype } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

const PersonligOppmøteFaktablokk = (props: { søknadInnhold: SøknadInnhold }) => {
    const intl = useI18n({ messages });

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
                                  props.søknadInnhold.forNav.grunnForPapirinnsending === GrunnForPapirinnsending.Annet
                                      ? props.søknadInnhold.forNav.annenGrunn ?? '-'
                                      : props.søknadInnhold.forNav.grunnForPapirinnsending,
                          },
                      ]
            }
        />
    );
};

export default PersonligOppmøteFaktablokk;

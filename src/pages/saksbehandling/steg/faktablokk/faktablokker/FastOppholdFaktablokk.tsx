import AlertStripe from 'nav-frontend-alertstriper';
import React from 'react';
import { IntlShape } from 'react-intl';

import { IngenAdresseGrunn } from '~api/personApi';
import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { formatAdresse } from '~lib/formatUtils';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import boOgOppholdSøknadMessages from '~pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import flyktningstatusSøknadMessages from '~pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { FastOppholdINorgeStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Vilkårsblokk from '../../../vilkårsOppsummering/VilkårsBlokk';
import saksbehandlingMessages from '../../fast-opphold-i-norge/fastOppholdINorge-nb';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const FastOppholdFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({
        messages: {
            ...messages,
            ...flyktningstatusSøknadMessages,
            ...boOgOppholdSøknadMessages,
        },
    });
    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={createFaktaBlokkArray(props.søknadInnhold, intl)}
        />
    );
};

const createFaktaBlokkArray = (søknadsInnhold: SøknadInnhold, intl: IntlShape) => {
    const søknadMessage = (s: keyof typeof flyktningstatusSøknadMessages) => s;

    const arr = [];
    arr.push({
        tittel: intl.formatMessage({ id: søknadMessage('input.norsk.statsborger.label') }),
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger
            ? intl.formatMessage({ id: 'fraSøknad.ja' })
            : intl.formatMessage({ id: 'fraSøknad.nei' }),
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: intl.formatMessage({ id: søknadMessage('input.oppholdstillatelse.label') }),
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        });
        arr.push({
            tittel: intl.formatMessage({ id: søknadMessage('input.hvilken.oppholdstillatelse.label') }),
            verdi:
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse ??
                intl.formatMessage({ id: 'fraSøknad.ikkeRegistert' }),
        });
    }
    arr.push({
        tittel: intl.formatMessage({ id: 'fastOpphold.adresse' }),
        verdi: søknadsInnhold.boforhold.borPåAdresse
            ? formatAdresse(søknadsInnhold.boforhold.borPåAdresse)
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE
            ? intl.formatMessage({
                  id: keyOf<typeof boOgOppholdSøknadMessages>('input.adresse.ingenAdresse.borPåAnnenAdresse'),
              })
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
            ? intl.formatMessage({
                  id: keyOf<typeof boOgOppholdSøknadMessages>('input.adresse.ingenAdresse.harIkkeFastBosted'),
              })
            : intl.formatMessage({ id: 'fraSøknad.ikkeRegistert' }),
    });
    return arr;
};

export const FastOppholdVilkårsblokk = (props: VilkårsblokkProps<'fastOppholdINorge'>) => {
    const intl = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<FastOppholdFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.fastOpphold.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status === FastOppholdINorgeStatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status ===
                                          FastOppholdINorgeStatus.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : intl.formatMessage({ id: 'fraSøknad.uavklart' }),
                            },
                        ]}
                    />
                )
            }
            status={props.info.status}
            begrunnelse={props.info.begrunnelse}
        />
    );
};

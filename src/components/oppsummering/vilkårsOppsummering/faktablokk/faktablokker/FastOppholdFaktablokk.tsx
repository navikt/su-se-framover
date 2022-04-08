import { Alert } from '@navikt/ds-react';
import React from 'react';
import { IntlShape } from 'react-intl';

import { IngenAdresseGrunn } from '~src/api/personApi';
import { useI18n } from '~src/lib/i18n';
import { keyOf } from '~src/lib/types';
import boOgOppholdSøknadMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import flyktningstatusSøknadMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { SøknadInnhold } from '~src/types/Søknad';
import { formatAdresse } from '~src/utils/format/formatUtils';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/fast-opphold-i-norge/fastOppholdINorge-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const FastOppholdFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({
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
        tittel: intl.formatMessage({ id: søknadMessage('norsk.statsborger.label') }),
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger
            ? intl.formatMessage({ id: 'fraSøknad.ja' })
            : intl.formatMessage({ id: 'fraSøknad.nei' }),
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: intl.formatMessage({ id: søknadMessage('oppholdstillatelse.label') }),
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        });
        arr.push({
            tittel: intl.formatMessage({ id: søknadMessage('oppholdstillatelse.type') }),
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
                  id: keyOf<typeof boOgOppholdSøknadMessages>('adresse.ingenAdresse.borPåAnnenAdresse'),
              })
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
            ? intl.formatMessage({
                  id: keyOf<typeof boOgOppholdSøknadMessages>('adresse.ingenAdresse.harIkkeFastBosted'),
              })
            : intl.formatMessage({ id: 'fraSøknad.ikkeRegistert' }),
    });
    return arr;
};

export const FastOppholdVilkårsblokk = (props: VilkårsblokkProps<'fastOppholdINorge'>) => {
    const { intl } = useI18n({
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
                    <Alert variant="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</Alert>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.fastOpphold.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status === Vilkårstatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status === Vilkårstatus.VilkårIkkeOppfylt
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

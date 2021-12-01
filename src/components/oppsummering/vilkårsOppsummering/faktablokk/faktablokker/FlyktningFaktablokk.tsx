import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { keyOf } from '~lib/types';
import søknadMessages from '~pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { Vilkårstatus } from '~types/Behandlingsinformasjon';
import { vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/flyktning/flyktning-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const FlyktningFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: keyOf<typeof søknadMessages>('flyktning.label') }),
                    verdi: props.søknadInnhold.flyktningsstatus.registrertFlyktning
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export const FlyktningVilkårsblokk = (props: VilkårsblokkProps<'flyktning'>) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <Alert variant="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</Alert>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.flyktning.legend'),
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

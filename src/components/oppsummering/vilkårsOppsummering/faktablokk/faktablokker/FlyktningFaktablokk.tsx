import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { keyOf } from '~src/lib/types';
import søknadMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { VilkårtypeFelles, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/flyktning/flyktning-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

export const FlyktningFaktablokk = (props: { søknadInnhold: SøknadInnholdUføre }) => {
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

interface Props {
    søknadInnhold: SøknadInnholdUføre;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger['flyktning'];
    status: VilkårVurderingStatus;
}

export const FlyktningVilkårsblokk = (props: Props) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeFelles.Flyktning)}
            søknadfaktablokk={<FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.grunnlagsdataOgVilkårsvurderinger?.resultat === null ? (
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
                                    props.grunnlagsdataOgVilkårsvurderinger?.resultat === Vilkårstatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.grunnlagsdataOgVilkårsvurderinger?.resultat ===
                                          Vilkårstatus.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : intl.formatMessage({ id: 'fraSøknad.uavklart' }),
                            },
                        ]}
                    />
                )
            }
            status={props.status}
        />
    );
};

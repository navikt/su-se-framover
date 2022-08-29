import { Alert } from '@navikt/ds-react';
import React, { useMemo } from 'react';

import { useI18n } from '~src/lib/i18n';
import { keyOf, Nullable } from '~src/lib/types';
import søknadMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import { InstitusjonsoppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårstatus } from '~src/types/Vilkår';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/institusjonsopphold/institusjonsopphold-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const InstitusjonsoppholdBlokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    const message = (s: keyof typeof messages) => intl.formatMessage({ id: s });
    const søknadMessage = (s: keyof typeof søknadMessages) => intl.formatMessage({ id: s });

    const fakta = useMemo(() => {
        const arr = [
            {
                tittel: søknadMessage('innlagtPåInstitusjon.label'),
                verdi: message(props.søknadInnhold.boforhold.innlagtPåInstitusjon ? 'fraSøknad.ja' : 'fraSøknad.nei'),
            },
        ];

        if (props.søknadInnhold.boforhold.innlagtPåInstitusjon?.datoForInnleggelse) {
            arr.push({
                tittel: søknadMessage('innlagtPåInstitusjon.datoForInnleggelse'),
                verdi: intl.formatDate(props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForInnleggelse),
            });

            arr.push({
                tittel: søknadMessage('innlagtPåInstitusjon.datoForUtskrivelse'),
                verdi: props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse
                    ? intl.formatDate(props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse)
                    : props.søknadInnhold.boforhold.innlagtPåInstitusjon.fortsattInnlagt
                    ? søknadMessage('innlagtPåInstitusjon.fortsattInnlagt')
                    : '',
            });
        }

        return arr;
    }, [props.søknadInnhold, intl]);

    return <Faktablokk tittel={intl.formatMessage({ id: 'display.fraSøknad' })} fakta={fakta} />;
};

export const InstitusjonsoppholdVilkårsblokk = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
}) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    const institusjonsopphold = props.institusjonsopphold?.vurderingsperioder[0] ?? null;

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<InstitusjonsoppholdBlokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                institusjonsopphold === null ? (
                    <Alert variant="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</Alert>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>(
                                        'radio.institusjonsoppholdFørerTilAvslag.legend'
                                    ),
                                }),
                                verdi:
                                    institusjonsopphold.vurdering === Vilkårstatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : institusjonsopphold.vurdering === Vilkårstatus.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : intl.formatMessage({
                                              id: 'fraSøknad.uavklart',
                                          }),
                            },
                        ]}
                    />
                )
            }
        />
    );
};

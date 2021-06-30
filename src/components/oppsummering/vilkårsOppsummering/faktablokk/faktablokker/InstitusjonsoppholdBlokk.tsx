import AlertStripe from 'nav-frontend-alertstriper';
import React, { useMemo } from 'react';

import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import søknadMessages from '~pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import { InstitusjonsoppholdStatus } from '~types/Behandlingsinformasjon';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/steg/institusjonsopphold/institusjonsopphold-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const InstitusjonsoppholdBlokk = (props: FaktablokkProps) => {
    const intl = useI18n({
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

export const InstitusjonsoppholdVilkårsblokk = (props: VilkårsblokkProps<'institusjonsopphold'>) => {
    const intl = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<InstitusjonsoppholdBlokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
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
                                    props.behandlingsinformasjon.status === InstitusjonsoppholdStatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : props.behandlingsinformasjon.status ===
                                          InstitusjonsoppholdStatus.VilkårIkkeOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : intl.formatMessage({
                                              id: 'fraSøknad.uavklart',
                                          }),
                            },
                        ]}
                    />
                )
            }
            begrunnelse={props.info.begrunnelse}
        />
    );
};

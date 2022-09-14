import { Alert } from '@navikt/ds-react';
import React, { useMemo } from 'react';

import OppsummeringAvInstitusjonsoppholdvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvInstitusjonsopphold';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import søknadMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import { InstitusjonsoppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const InstitusjonsoppholdBlokk = (props: FaktablokkProps) => {
    const { intl, formatMessage } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    const fakta = useMemo(() => {
        const arr = [
            {
                tittel: formatMessage('innlagtPåInstitusjon.label'),
                verdi: formatMessage(
                    props.søknadInnhold.boforhold.innlagtPåInstitusjon ? 'fraSøknad.ja' : 'fraSøknad.nei'
                ),
            },
        ];

        if (props.søknadInnhold.boforhold.innlagtPåInstitusjon?.datoForInnleggelse) {
            arr.push({
                tittel: formatMessage('innlagtPåInstitusjon.datoForInnleggelse'),
                verdi: intl.formatDate(props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForInnleggelse),
            });

            arr.push({
                tittel: formatMessage('innlagtPåInstitusjon.datoForUtskrivelse'),
                verdi: props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse
                    ? intl.formatDate(props.søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse)
                    : props.søknadInnhold.boforhold.innlagtPåInstitusjon.fortsattInnlagt
                    ? formatMessage('innlagtPåInstitusjon.fortsattInnlagt')
                    : '',
            });
        }

        return arr;
    }, [props.søknadInnhold, intl]);

    return <Faktablokk tittel={formatMessage('display.fraSøknad')} fakta={fakta} />;
};

export const InstitusjonsoppholdVilkårsblokk = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<InstitusjonsoppholdBlokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.institusjonsopphold === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvInstitusjonsoppholdvilkår
                        institusjonsopphold={props.institusjonsopphold}
                        visesIVedtak
                    />
                )
            }
        />
    );
};

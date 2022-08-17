import { Alert } from '@navikt/ds-react';
import React, { useMemo } from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import søknadMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { LovligOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/lovlig-opphold-i-norge/lovligOppholdINorge-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const LovligOppholdFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    const søknadMessage = (s: keyof typeof søknadMessages) => intl.formatMessage({ id: s });

    const fakta = useMemo(() => {
        const arr = [
            booleanToJaNei(
                props.søknadInnhold.oppholdstillatelse.erNorskStatsborger,
                søknadMessage('norsk.statsborger.label'),
                intl
            ),
        ];

        if (!props.søknadInnhold.oppholdstillatelse.erNorskStatsborger) {
            arr.push(
                booleanToJaNei(
                    props.søknadInnhold.oppholdstillatelse.harOppholdstillatelse,
                    søknadMessage('oppholdstillatelse.label'),
                    intl
                )
            );
        }
        if (props.søknadInnhold.oppholdstillatelse.harOppholdstillatelse) {
            arr.push(
                createFakta(
                    props.søknadInnhold.oppholdstillatelse.typeOppholdstillatelse,
                    søknadMessage('oppholdstillatelse.type')
                )
            );
        }

        if (props.søknadInnhold.oppholdstillatelse.statsborgerskapAndreLand) {
            arr.push(
                createFakta(
                    props.søknadInnhold.oppholdstillatelse.statsborgerskapAndreLandFritekst,
                    søknadMessage('statsborger.andre.land.fritekst')
                )
            );
        }

        return arr;
    }, [props.søknadInnhold, intl]);

    return <Faktablokk tittel={intl.formatMessage({ id: 'display.fraSøknad' })} fakta={fakta} />;
};

const booleanToJaNei = (verdi: Nullable<boolean>, tittel: string, intl: IntlShape) => {
    if (verdi == null) return { tittel: tittel, verdi: '' };

    return {
        tittel: tittel,
        verdi: verdi.valueOf()
            ? intl.formatMessage({ id: 'fraSøknad.ja' })
            : intl.formatMessage({ id: 'fraSøknad.nei' }),
    };
};

const createFakta = (verdi: Nullable<string>, tittel: string) => {
    if (!verdi) return { tittel: tittel, verdi: '' };

    return {
        tittel: tittel,
        verdi: verdi.valueOf(),
    };
};

export const LovligOppholdVilkårsblokk = (props: {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    lovligOpphold: Nullable<LovligOppholdVilkår>;
}) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });

    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            søknadfaktablokk={<LovligOppholdFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                !props.lovligOpphold?.resultat ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <Faktablokk
                        tittel={formatMessage('display.fraSaksbehandling')}
                        fakta={[
                            {
                                tittel: formatMessage('lovligOpphold.vilkår'),
                                verdi:
                                    props.lovligOpphold?.resultat === Vilkårstatus.VilkårOppfylt
                                        ? formatMessage('fraSøknad.ja')
                                        : props.lovligOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt
                                        ? formatMessage('fraSøknad.nei')
                                        : formatMessage('fraSøknad.uavklart'),
                            },
                        ]}
                    />
                )
            }
            status={props.info.status}
        />
    );
};

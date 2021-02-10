import AlertStripe from 'nav-frontend-alertstriper';
import React, { useMemo } from 'react';
import { IntlShape } from 'react-intl';

import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { keyOf, Nullable } from '~lib/types';
import søknadMessages from '~pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { LovligOppholdStatus } from '~types/Behandlingsinformasjon';

import Vilkårsblokk from '../../../vilkårsOppsummering/VilkårsBlokk';
import saksbehandlingMessages from '../../lovlig-opphold-i-norge/lovligOppholdINorge-nb';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const LovligOppholdFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({
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
                søknadMessage('input.norsk.statsborger.label'),
                intl
            ),
        ];

        if (!props.søknadInnhold.oppholdstillatelse.erNorskStatsborger) {
            arr.push(
                booleanToJaNei(
                    props.søknadInnhold.oppholdstillatelse.harOppholdstillatelse,
                    søknadMessage('input.oppholdstillatelse.label'),
                    intl
                )
            );
        }
        if (props.søknadInnhold.oppholdstillatelse.harOppholdstillatelse) {
            arr.push(
                createFakta(
                    props.søknadInnhold.oppholdstillatelse.typeOppholdstillatelse,
                    søknadMessage('input.hvilken.oppholdstillatelse.label')
                )
            );
        }

        if (props.søknadInnhold.oppholdstillatelse.statsborgerskapAndreLand) {
            arr.push(
                createFakta(
                    props.søknadInnhold.oppholdstillatelse.statsborgerskapAndreLandFritekst,
                    søknadMessage('input.statsborger.andre.land.fritekst.label')
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

export const LovligOppholdVilkårsblokk = (props: VilkårsblokkProps<'lovligOpphold'>) => {
    const intl = useI18n({
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
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.lovligOpphold.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status === LovligOppholdStatus.VilkårOppfylt
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status === LovligOppholdStatus.VilkårIkkeOppfylt
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

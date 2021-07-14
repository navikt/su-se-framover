import * as DateFns from 'date-fns';
import AlertStripe from 'nav-frontend-alertstriper';
import React from 'react';

import { kalkulerTotaltAntallDagerIUtlandet } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import { OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';
import { vilkårTittelFormatted } from '~Utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/opphold-i-utlandet/oppholdIUtlandet-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { customFakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const UtenlandsOppholdFaktablokk = (props: FaktablokkProps) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
        },
    });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({
                        id: 'utenlandsOpphold.antallDagerSiste90',
                    }),
                    verdi: kalkulerTotaltAntallDagerIUtlandet(
                        props.søknadInnhold.utenlandsopphold.registrertePerioder
                    ).toString(),
                },
                ...(props.søknadInnhold.utenlandsopphold.registrertePerioder === null
                    ? []
                    : [reisedatoer(props.søknadInnhold.utenlandsopphold.registrertePerioder), FaktaSpacing]),
                {
                    tittel: intl.formatMessage({
                        id: 'utenlandsOpphold.antallDagerPlanlagt',
                    }),
                    verdi: kalkulerTotaltAntallDagerIUtlandet(
                        props.søknadInnhold.utenlandsopphold.planlagtePerioder
                    ).toString(),
                },
                ...(props.søknadInnhold.utenlandsopphold.planlagtePerioder === null
                    ? []
                    : [reisedatoer(props.søknadInnhold.utenlandsopphold.planlagtePerioder), FaktaSpacing]),
            ]}
        />
    );
};

function reisedatoer(rader: Array<{ utreisedato: string; innreisedato: string }>) {
    return customFakta(
        <ul className={styles.reisedatoer}>
            {rader.map((r, idx) => (
                <li key={idx}>{`${formatDate(r.utreisedato)} - ${formatDate(r.innreisedato)}`}</li>
            ))}
        </ul>
    );
}

function formatDate(date: string) {
    return DateFns.parseISO(date).toLocaleDateString();
}

export const UtenlandsoppholdVilkårsblokk = (props: VilkårsblokkProps<'oppholdIUtlandet'>) => {
    const { intl } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<UtenlandsOppholdFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.oppholdIUtland.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status ===
                                    OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status ===
                                          OppholdIUtlandetStatus.SkalHoldeSegINorge
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
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

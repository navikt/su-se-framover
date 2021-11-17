import { Alert } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { keyOf } from '~lib/types';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { SøknadInnhold } from '~types/Søknad';
import { kalkulerTotaltAntallDagerIUtlandet } from '~utils/date/dateUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/opphold-i-utlandet/oppholdIUtlandet-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { customFakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

export interface UtenlandsoppholdVilkårsblokkPros {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}

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

export const UtenlandsoppholdVilkårsblokk = (props: UtenlandsoppholdVilkårsblokkPros) => {
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
                (props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold.vurderinger[0]?.status ?? null) === null ? (
                    <Alert variant="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</Alert>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.oppholdIUtland.legend'),
                                }),
                                verdi:
                                    props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold.vurderinger[0].status ===
                                    Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold.vurderinger[0]
                                              .status === Utenlandsoppholdstatus.SkalHoldeSegINorge
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

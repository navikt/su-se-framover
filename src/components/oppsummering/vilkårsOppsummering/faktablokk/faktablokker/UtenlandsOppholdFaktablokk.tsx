import { Alert } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';

import OppsummeringAvUtenlandsopphold from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUtenlandsopphold';
import { useI18n } from '~src/lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~src/types/Søknad';
import { kalkulerTotaltAntallDagerIUtlandet } from '~src/utils/date/dateUtils';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/opphold-i-utlandet/oppholdIUtlandet-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk, { customFakta, FaktaSpacing } from '../Faktablokk';

import messages from './faktablokker-nb';
import * as styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

export interface UtenlandsoppholdVilkårsblokkPros {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}

export const UtenlandsOppholdFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('utenlandsOpphold.antallDagerSiste90'),
                    verdi: kalkulerTotaltAntallDagerIUtlandet(
                        props.søknadInnhold.utenlandsopphold.registrertePerioder
                    ).toString(),
                },
                ...(props.søknadInnhold.utenlandsopphold.registrertePerioder === null
                    ? []
                    : [reisedatoer(props.søknadInnhold.utenlandsopphold.registrertePerioder), FaktaSpacing]),
                {
                    tittel: formatMessage('utenlandsOpphold.antallDagerPlanlagt'),
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
    const { formatMessage } = useI18n({
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
                (props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ?? null) === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvUtenlandsopphold
                        utenlandsopphold={props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                        visesIVedtak
                    />
                )
            }
        />
    );
};

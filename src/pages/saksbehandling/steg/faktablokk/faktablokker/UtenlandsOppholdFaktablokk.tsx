import * as DateFns from 'date-fns';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import { kalkulerTotaltAntallDagerIUtlandet, Utlandsdatoer } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';

import Faktablokk, { Fakta } from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

const UtenlandsOppholdFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    const fakta: Fakta[] = [
        {
            tittel: intl.formatMessage({ id: 'utenlandsOpphold.antallDagerSiste90' }),
            verdi: kalkulerTotaltAntallDagerIUtlandet(
                props.søknadInnhold.utenlandsopphold.registrertePerioder
            ).toString(),
        },
        {
            tittel: intl.formatMessage({ id: 'utenlandsOpphold.antallDagerPlanlagt' }),
            verdi: kalkulerTotaltAntallDagerIUtlandet(
                props.søknadInnhold.utenlandsopphold.planlagtePerioder
            ).toString(),
        },
    ];

    const datoerSiste90 = props.søknadInnhold.utenlandsopphold.registrertePerioder;
    if (datoerSiste90 && datoerSiste90.length > 0) {
        fakta.push({
            tittel: intl.formatMessage({ id: 'utenlandsOpphold.datoerSiste90' }),
            verdi: visDatoer(datoerSiste90, intl),
        });
    }

    const datoerPlanlagt = props.søknadInnhold.utenlandsopphold.planlagtePerioder;
    if (datoerPlanlagt && datoerPlanlagt.length > 0) {
        fakta.push({
            tittel: intl.formatMessage({ id: 'utenlandsOpphold.datoerPlanlagt' }),
            verdi: visDatoer(datoerPlanlagt, intl),
        });
    }

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            brukUndertittel={props.brukUndertittel}
            fakta={fakta}
        />
    );
};

const visDatoer = (datesArray: Nullable<Utlandsdatoer>, intl: IntlShape) => {
    if (!datesArray || datesArray?.length === 0) return intl.formatMessage({ id: 'fraSøknad.ikkeRegistert' });

    return (
        <div>
            {datesArray.map((datoRad, index) => (
                <div key={index} className={styles.datoFelterContainer}>
                    <DatoFelt
                        label={'Utreisedato'}
                        verdi={DateFns.parseISO(datoRad.utreisedato).toLocaleDateString()}
                    />
                    <DatoFelt
                        label={'Innreisedato'}
                        verdi={DateFns.parseISO(datoRad.innreisedato).toLocaleDateString()}
                    />
                </div>
            ))}
        </div>
    );
};

const DatoFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

export default UtenlandsOppholdFaktablokk;

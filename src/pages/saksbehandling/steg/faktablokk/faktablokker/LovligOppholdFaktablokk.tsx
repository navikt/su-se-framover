import React from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps } from './faktablokkUtils';

const LovligOppholdFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            tittelType={props.tittelType}
            containerClassName={styles.lovligOppholdFaktaBlokkContainer}
            faktaBlokkerClassName={styles.lovligOppholdFaktaBlokk}
            fakta={createListOfFakta(intl, props.søknadInnhold)}
        />
    );
};

function createListOfFakta(intl: IntlShape, søknadsInnhold: SøknadInnhold) {
    const arr = [
        booleanToJaNei(
            søknadsInnhold.oppholdstillatelse.erNorskStatsborger,
            intl.formatMessage({ id: 'lovligOpphold.erNorskStatsborger' }),
            intl
        ),
    ];

    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push(
            booleanToJaNei(
                søknadsInnhold.oppholdstillatelse.harOppholdstillatelse,
                intl.formatMessage({ id: 'lovligOpphold.harOppholdstillatelse' }),
                intl
            )
        );
    }
    if (søknadsInnhold.oppholdstillatelse.harOppholdstillatelse) {
        arr.push(
            createFakta(
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse,
                intl.formatMessage({ id: 'lovligOpphold.typeOppholdstillatelse' })
            )
        );
    }

    if (søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLand) {
        arr.push(
            createFakta(
                søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLandFritekst,
                intl.formatMessage({ id: 'lovligOpphold.statsborgerskapAndreLand' })
            )
        );
    }

    return arr;
}

const booleanToJaNei = (verdi: Nullable<boolean>, tittel: string, intl: IntlShape) => {
    if (!verdi) return { tittel: tittel, verdi: '' };

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

export default LovligOppholdFaktablokk;

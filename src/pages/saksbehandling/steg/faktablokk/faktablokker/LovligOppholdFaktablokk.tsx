import React from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';

const LovligOppholdFaktablokk = (props: { søknadInnhold: SøknadInnhold }) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            containerClassName={styles.lovligOppholdFaktaBlokkContainer}
            faktaBlokkerClassName={styles.lovligOppholdFaktaBlokk}
            fakta={createFaktaBlokkArray(intl, props.søknadInnhold)}
        />
    );
};

function createFaktaBlokkArray(intl: IntlShape, søknadsInnhold: SøknadInnhold) {
    const arr = [
        createFaktaBlokkObject(
            søknadsInnhold.oppholdstillatelse.erNorskStatsborger,
            intl.formatMessage({ id: 'lovligOpphold.erNorskStatsborger' }),
            intl
        ),
    ];

    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.harOppholdstillatelse,
                intl.formatMessage({ id: 'lovligOpphold.harOppholdstillatelse' }),
                intl
            )
        );
    }
    if (søknadsInnhold.oppholdstillatelse.harOppholdstillatelse) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse,
                intl.formatMessage({ id: 'lovligOpphold.typeOppholdstillatelse' }),
                intl
            )
        );
    }

    if (søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLand) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLandFritekst,
                intl.formatMessage({ id: 'lovligOpphold.statsborgerskapAndreLand' }),
                intl
            )
        );
    }

    return arr;
}

function createFaktaBlokkObject(oppholdstillatelsePair: Nullable<boolean | string>, tittel: string, intl: IntlShape) {
    if (typeof oppholdstillatelsePair === 'string') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf(),
        };
    } else if (typeof oppholdstillatelsePair === 'boolean') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf()
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        };
    } else {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        };
    }
}

export default LovligOppholdFaktablokk;

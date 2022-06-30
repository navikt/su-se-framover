import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { LovligOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';

import messages from './gjeldendeLovligOpphold-nb';
import styles from './gjeldendeLovligOpphold.module.less';

const GjeldendeOppholdstillatelse = (props: { gjeldendeOppholdstillatelse: Nullable<LovligOppholdVilkår> }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {formatMessage('eksisterende.vedtakinfo.tittel')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendeOppholdstillatelse?.vurderinger?.map((oppholdstillatelse) => (
                    <li key={`${oppholdstillatelse.periode.fraOgMed} - ${oppholdstillatelse.periode.tilOgMed}`}>
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('datepicker.fom')}
                            verdi={oppholdstillatelse.periode.fraOgMed}
                        />
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('datepicker.tom')}
                            verdi={oppholdstillatelse.periode.tilOgMed}
                        />
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('resultat')}
                            verdi={oppholdstillatelse.resultat}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeOppholdstillatelse;

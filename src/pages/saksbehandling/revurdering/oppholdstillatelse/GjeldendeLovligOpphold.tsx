import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { LovligOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { formatDate } from '~src/utils/date/dateUtils';

import messages from './gjeldendeLovligOpphold-nb';
import styles from './gjeldendeLovligOpphold.module.less';

const GjeldendeOppholdstillatelse = (props: { gjeldendeOppholdstillatelse: Nullable<LovligOppholdVilkår> }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });

    return (
        <div>
            <Heading level="2" size="large" spacing>
                {formatMessage('eksisterende.vedtakinfo.tittel')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendeOppholdstillatelse?.vurderinger?.map((oppholdstillatelse) => (
                    <li key={`${oppholdstillatelse.periode.fraOgMed} - ${oppholdstillatelse.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(oppholdstillatelse.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(oppholdstillatelse.periode.tilOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('resultat')}
                            verdi={formatMessage(oppholdstillatelse.resultat)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeOppholdstillatelse;

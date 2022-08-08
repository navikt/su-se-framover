import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

import styles from './gjeldendePersonligOppmøte.module.less';
import messages from './personligOppmøte-nb';

export function GjeldendePersonligOppmøte(props: {
    gjeldendePersonligOppmøte: GrunnlagsdataOgVilkårsvurderinger['personligOppmøte'];
}) {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size="large" level="2" spacing>
                {formatMessage('gjeldende.overskrift')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendePersonligOppmøte?.vurderinger?.map((personligOppmøte) => (
                    <li key={`${personligOppmøte.periode.fraOgMed} - ${personligOppmøte.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(personligOppmøte.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(personligOppmøte.periode.tilOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('vurdering')}
                            verdi={formatMessage(personligOppmøte.vurdering)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

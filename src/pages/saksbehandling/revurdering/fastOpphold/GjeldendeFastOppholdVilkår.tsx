import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

import messages from './fastOpphold-nb';
import styles from './gjeldendeFastOppholdVilkår.module.less';

export function GjeldendeFastOppholdVilkår(props: {
    gjeldendeFastOppholdVilkår: GrunnlagsdataOgVilkårsvurderinger['fastOpphold'];
}) {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });
    return (
        <div>
            <Heading size="large" level="2" spacing>
                {formatMessage('gjeldende.overskrift')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendeFastOppholdVilkår?.vurderinger?.map((fastOpphold) => (
                    <li key={`${fastOpphold.periode.fraOgMed} - ${fastOpphold.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(fastOpphold.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(fastOpphold.periode.tilOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('resultat')}
                            verdi={formatMessage(fastOpphold.resultat)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

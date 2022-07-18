import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

import messages from './flyktning-nb';
import styles from './gjeldendeFlyktningVilkår.module.less';

const GjeldendeFlyktningVilkår = (props: {
    gjeldendeFlyktingVilkår: GrunnlagsdataOgVilkårsvurderinger['flyktning'];
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });
    return (
        <div>
            <Heading size="large" level="2" spacing>
                {formatMessage('gjeldende.overskrift')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendeFlyktingVilkår?.vurderinger?.map((flyktning) => (
                    <li key={`${flyktning.periode.fraOgMed} - ${flyktning.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(flyktning.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(flyktning.periode.tilOgMed)}
                        />
                        <OppsummeringPar label={formatMessage('resultat')} verdi={formatMessage(flyktning.resultat)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeFlyktningVilkår;

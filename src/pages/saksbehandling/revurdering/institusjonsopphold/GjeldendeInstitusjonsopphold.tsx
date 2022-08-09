import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

import styles from './gjeldendeInstitusjonsopphold.module.less';
import messages from './institusjonsopphold-nb';

const GjeldendeInstitusjonsopphold = (props: {
    gjeldendeInstitusjonsopphold: GrunnlagsdataOgVilkårsvurderinger['institusjonsopphold'];
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });
    return (
        <div>
            <Heading size="large" level="2" spacing>
                {formatMessage('gjeldende.overskrift')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.gjeldendeInstitusjonsopphold?.vurderinger?.map((institusjonsopphold) => (
                    <li key={`${institusjonsopphold.periode.fraOgMed} - ${institusjonsopphold.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(institusjonsopphold.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(institusjonsopphold.periode.tilOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('resultat')}
                            verdi={formatMessage(institusjonsopphold.resultat)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeInstitusjonsopphold;

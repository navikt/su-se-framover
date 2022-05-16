import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import opplysningspliktMessages from '~src/pages/saksbehandling/revurdering/opplysningsplikt/opplysningsplikt-nb';
import { OpplysningspliktVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './Opplysningspliktoppsummering-nb';
import * as styles from './opplysningspliktoppsummering.module.less';

const Opplysningspliktoppsummering = (props: { opplysningsplikter: OpplysningspliktVilkår }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...opplysningspliktMessages } });

    return (
        <ul className={styles.opplysningspliktoppsummering}>
            {props.opplysningsplikter.vurderinger.map((opplysningsplikt) => (
                <li key={formatPeriode(opplysningsplikt.periode)}>
                    <OppsummeringPar
                        label={formatMessage('periode.label')}
                        verdi={formatPeriode(opplysningsplikt.periode)}
                    />
                    <OppsummeringPar
                        label={formatMessage('select.label')}
                        verdi={formatMessage(opplysningsplikt.beskrivelse)}
                    />
                </li>
            ))}
        </ul>
    );
};

export default Opplysningspliktoppsummering;

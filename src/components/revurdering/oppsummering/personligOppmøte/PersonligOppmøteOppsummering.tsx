import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import personligOppmøteMessages from '~src/pages/saksbehandling/revurdering/personligOppmøte/personligOppmøte-nb';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { PersonligOppmøteVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './personligOppmøteOppsummering-nb';
import styles from './personligOppmøteOppsummering.module.less';

const PersonligOppmøteOppsummering = (props: { personligOppmøteVilkår: PersonligOppmøteVilkår }) => {
    const { formatMessage } = useI18n({
        messages: { ...vilkårstatusMessages, ...messages },
    });
    //TODO: se på hvorfor man får kompileringsfeil når man speader flere typer - eks { ...personligOppmøteMessages, ...vilkårstatusMessages }
    const i18n = useI18n({
        messages: { ...personligOppmøteMessages },
    });

    return (
        <ul className={styles.grunnlagsliste}>
            {props.personligOppmøteVilkår.vurderinger.map((personligOppmøte) => (
                <li key={formatPeriode(personligOppmøte.periode)}>
                    <OppsummeringPar
                        label={formatMessage('periode.label')}
                        verdi={formatPeriode(personligOppmøte.periode)}
                    />
                    <OppsummeringPar
                        label={formatMessage('resultat')}
                        verdi={formatMessage(personligOppmøte.resultat)}
                    />
                    <OppsummeringPar
                        label={i18n.formatMessage('vurdering')}
                        verdi={i18n.formatMessage(personligOppmøte.vurdering)}
                    />
                </li>
            ))}
        </ul>
    );
};

export default PersonligOppmøteOppsummering;

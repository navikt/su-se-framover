import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    FastOppholdVilkår,
    VurderingsperiodeFastOpphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvFastOppholdvilkår = (props: { fastOpphold: Nullable<FastOppholdVilkår> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.oppsummeringsContainer}>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.fastOpphold?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.fastOpphold?.vurderinger?.map((u) => (
                    <li key={`${u.resultat} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeFastOppholdOppsummering vurderingsperiodeFastopphold={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeFastOppholdOppsummering = (props: {
    vurderingsperiodeFastopphold: VurderingsperiodeFastOpphold;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeFastopphold.periode)}
            />
            <OppsummeringPar
                label={formatMessage('fastOpphold.vilkår.text')}
                verdi={formatMessage(`bool.${props.vurderingsperiodeFastopphold.resultat}`)}
            />
        </>
    );
};

export default OppsummeringAvFastOppholdvilkår;

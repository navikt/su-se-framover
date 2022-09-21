import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    LovligOppholdVilkår,
    VurderingsperiodeLovligOpphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvLovligOppholdvilkår = (props: {
    lovligOpphold: Nullable<LovligOppholdVilkår>;
    visesIVedtak?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <OppsummeringPar
                className={classNames(styles.oppsummeringAvResultat)}
                label={formatMessage('vilkår.resultat')}
                //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.lovligOpphold?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.lovligOpphold?.vurderinger?.map((u) => (
                    <li key={`${u.resultat} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeLovligOppholdOppsummering vurderingsperiodeLovligopphold={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeLovligOppholdOppsummering = (props: {
    vurderingsperiodeLovligopphold: VurderingsperiodeLovligOpphold;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeLovligopphold.periode)}
            />
            <OppsummeringPar
                label={formatMessage('lovligOpphold.vilkår.text')}
                verdi={formatMessage(`bool.${props.vurderingsperiodeLovligopphold.resultat}`)}
            />
        </>
    );
};

export default OppsummeringAvLovligOppholdvilkår;

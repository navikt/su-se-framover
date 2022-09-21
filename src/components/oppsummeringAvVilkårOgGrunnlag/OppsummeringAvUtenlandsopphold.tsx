import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    UtenlandsoppholdVilkår,
    VurderingsperiodeUtenlandsopphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvUtenlandsopphold = (props: {
    utenlandsopphold: Nullable<UtenlandsoppholdVilkår>;
    visesIVedtak?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={classNames({ [styles.oppsummeringsContainer]: !props.visesIVedtak })}>
            <OppsummeringPar
                className={classNames(styles.oppsummeringAvResultat)}
                label={formatMessage('vilkår.resultat')}
                verdi={formatMessage(
                    props.utenlandsopphold?.status
                        ? `utenlandsopphold.vilkår.erOppfylt.${props.utenlandsopphold.status}`
                        : 'vilkår.ikkeVurdert'
                )}
            />
            <ul>
                {props.utenlandsopphold?.vurderinger?.map((u) => (
                    <li key={formatPeriode(u.periode)} className={styles.grunnlagsListe}>
                        <VurderingsperiodeUtenlandsoppholdOppsummering vurderingsperiodeUtenlandsopphold={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeUtenlandsoppholdOppsummering = (props: {
    vurderingsperiodeUtenlandsopphold: VurderingsperiodeUtenlandsopphold;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeUtenlandsopphold.periode)}
            />
            <OppsummeringPar
                label={formatMessage('utenlandsopphold.vilkår.text')}
                verdi={formatMessage(props.vurderingsperiodeUtenlandsopphold.status)}
            />
        </div>
    );
};

export default OppsummeringAvUtenlandsopphold;

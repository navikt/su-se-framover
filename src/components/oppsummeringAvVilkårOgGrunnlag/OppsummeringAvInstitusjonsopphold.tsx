import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    InstitusjonsoppholdVilkår,
    VurderingsperiodeInstitusjonsopphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvInstitusjonsoppholdvilkår = (props: {
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
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
                verdi={formatMessage(props.institusjonsopphold?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.institusjonsopphold?.vurderingsperioder?.map((u) => (
                    <li key={`${u.vurdering} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeInstitusjonsoppholdOppsummering vurderingsperiodeInstitusjonsopphold={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeInstitusjonsoppholdOppsummering = (props: {
    vurderingsperiodeInstitusjonsopphold: VurderingsperiodeInstitusjonsopphold;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeInstitusjonsopphold.periode)}
            />
            <OppsummeringPar
                label={formatMessage('institusjonsopphold.vilkår.text')}
                verdi={formatMessage(`!bool.${props.vurderingsperiodeInstitusjonsopphold.vurdering}`)}
            />
        </>
    );
};

export default OppsummeringAvInstitusjonsoppholdvilkår;

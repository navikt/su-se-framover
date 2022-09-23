import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Aldersvilkår, Aldersvurdering } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvAldersvilkår = (props: { aldersvilkår: Nullable<Aldersvilkår>; visesIVedtak?: boolean }) => {
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
                verdi={formatMessage(props.aldersvilkår?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.aldersvilkår?.vurderinger?.map((u) => (
                    <li key={`${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeFlyktningOppsummering vurderingsperiodeAlder={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeFlyktningOppsummering = (props: { vurderingsperiodeAlder: Aldersvurdering }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeAlder.periode)}
            />
            <OppsummeringPar
                label={formatMessage('alderspensjon.søktOmAlderspensjon')}
                verdi={formatMessage(props.vurderingsperiodeAlder.pensjonsopplysninger.folketrygd)}
            />
            <OppsummeringPar
                label={formatMessage('alderspensjon.søktOmAndrePensjonsordninger')}
                verdi={formatMessage(props.vurderingsperiodeAlder.pensjonsopplysninger.andreNorske)}
            />
            <OppsummeringPar
                label={formatMessage('alderspensjon.søktOmPensjonIUtlandet')}
                verdi={formatMessage(props.vurderingsperiodeAlder.pensjonsopplysninger.utenlandske)}
            />
        </>
    );
};

export default OppsummeringAvAldersvilkår;

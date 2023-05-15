import React from 'react';

import { Nullable } from '~src/lib/types';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';

import OppsummeringAvSkattegrunnlag from '../oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';

import styles from './OppsummeringAvEksterneGrunnlagSkatt.module.less';

const OppsummeringAvEksternGrunnlagSkatt = (props: { eksternGrunnlagSkatt: Nullable<EksternGrunnlagSkatt> }) => {
    return (
        <div className={styles.skattegrunnlagsInformasjonContainer}>
            {props.eksternGrunnlagSkatt?.søker && (
                <OppsummeringAvSkattegrunnlag skattegrunnlag={props.eksternGrunnlagSkatt.søker} />
            )}
            {props.eksternGrunnlagSkatt?.eps && (
                <OppsummeringAvSkattegrunnlag skattegrunnlag={props.eksternGrunnlagSkatt.eps} />
            )}
        </div>
    );
};

export default OppsummeringAvEksternGrunnlagSkatt;

import React from 'react';

import styles from './infolinje.module.less';

export const InfoLinje = (props: { tittel: string; value: string | number }) => (
    <div className={styles.infolinje}>
        <span>{props.tittel}</span>
        <span>{props.value}</span>
    </div>
);

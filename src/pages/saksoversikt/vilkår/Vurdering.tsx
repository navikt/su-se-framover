import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import styles from './vurdering.module.less';

export const Vurdering = (props: {
    tittel: string;
    children: {
        left: JSX.Element;
        right: JSX.Element;
    };
}) => (
    <div className={styles.container}>
        <Innholdstittel className={styles.tittel}>{props.tittel}</Innholdstittel>
        <div className={styles.contentContainer}>
            <div className={styles.left}>{props.children.left}</div>
            <div className={styles.right}>{props.children.right}</div>
        </div>
    </div>
);

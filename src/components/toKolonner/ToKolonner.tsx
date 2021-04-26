import { Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';

import styles from './toKolonner.module.less';

const ToKolonner = (props: {
    tittel: string;
    children: {
        left: JSX.Element;
        right: JSX.Element;
    };
}) => (
    <div className={styles.contentContainer}>
        <div className={styles.left}>
            <Systemtittel tag="h1" className={styles.tittel}>
                {props.tittel}
            </Systemtittel>
            {props.children.left}
        </div>
        <div className={styles.rightContainer}>
            <div className={styles.right}>{props.children.right}</div>
        </div>
    </div>
);

export default ToKolonner;

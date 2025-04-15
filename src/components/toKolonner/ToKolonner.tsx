import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';

import styles from './toKolonner.module.less';

const ToKolonner = (props: {
    tittel: string | React.ReactElement;
    children: {
        left: React.ReactElement;
        right: React.ReactElement | null;
    };
    width?: '50/50' | '60/40' | '40/60';
}) => (
    <div className={styles.contentContainer}>
        <div
            className={classNames({
                [styles.left]: true,
                [styles.width60]: props.width === '60/40',
                [styles.width50]: props.width === '50/50' || !props.width,
                [styles.width40]: props.width === '40/60',
            })}
        >
            {typeof props.tittel === 'string' ? (
                <Heading level="1" size="large" spacing>
                    {props.tittel}
                </Heading>
            ) : (
                props.tittel
            )}
            {props.children.left}
        </div>
        <div
            className={classNames({
                [styles.rightContainer]: true,
                [styles.width60]: props.width === '40/60',
                [styles.width50]: props.width === '50/50' || !props.width,
                [styles.width40]: props.width === '60/40',
            })}
        >
            <div className={styles.right}>{props.children.right}</div>
        </div>
    </div>
);

export default ToKolonner;

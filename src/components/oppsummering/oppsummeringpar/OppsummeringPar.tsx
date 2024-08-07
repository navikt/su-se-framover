import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';

import styles from './oppsummeringPar.module.less';

interface Props {
    label: string;
    verdi: string | number | undefined | null;
    retning?: 'horisontal' | 'vertikal';
    textSomSmall?: boolean;
    className?: string;
}

/**
 * default retning er horisontal
 */
export const OppsummeringPar = ({ label, verdi, className = '', textSomSmall, retning = 'horisontal' }: Props) => {
    if (retning === 'vertikal') {
        return (
            <div className={classNames(styles.vertikalt, className)}>
                <Label size={textSomSmall ? 'small' : undefined}>{label}</Label>
                <BodyShort className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                    {verdi ?? ''}
                </BodyShort>
            </div>
        );
    }

    return (
        <div className={classNames(styles.oppsummeringspar, className)}>
            <BodyShort size={textSomSmall ? 'small' : undefined}>{label}</BodyShort>
            <Label className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                {verdi ?? ''}
            </Label>
        </div>
    );
};

import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import styles from './oppsummeringspar.module.less';

interface Props {
    label: string;
    verdi: string | number | undefined | null;
    className?: string;
}

export const OppsummeringPar = ({ label, verdi, className = '' }: Props) => (
    <div className={classNames(styles.oppsummeringspar, className)}>
        <BodyShort>{label}</BodyShort>
        <Label>{verdi ?? ''}</Label>
    </div>
);

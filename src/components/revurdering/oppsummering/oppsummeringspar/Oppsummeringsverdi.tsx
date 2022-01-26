import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import styles from './oppsummeringspar.module.less';

export enum OppsummeringsParSortering {
    Horisontalt = 'horisontalt',
    Vertikalt = 'Vertikalt',
}

interface Props {
    label: string;
    verdi: string | number | undefined | null;
    triple?: string | number | undefined | null;
    sorteres?: OppsummeringsParSortering;
    className?: string;
}

export const OppsummeringPar = ({
    label,
    verdi,
    triple,
    className = '',
    sorteres = OppsummeringsParSortering.Horisontalt,
}: Props) => {
    if (sorteres === OppsummeringsParSortering.Vertikalt) {
        return (
            <div className={classNames(styles.oppsummeringspar2, className)}>
                <Label>{label}</Label>
                <BodyShort>{verdi ?? ''}</BodyShort>
            </div>
        );
    }
    return (
        <div className={classNames(styles.oppsummeringspar, className)}>
            <BodyShort>{label}</BodyShort>
            <Label>{verdi ?? ''}</Label>
            {triple !== null && triple !== undefined && <Label>{triple}</Label>}
        </div>
    );
};

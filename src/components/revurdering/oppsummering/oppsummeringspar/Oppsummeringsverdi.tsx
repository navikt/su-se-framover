import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import * as styles from './oppsummeringspar.module.less';

export enum OppsummeringsParSortering {
    Horisontalt = 'horisontalt',
    Vertikalt = 'Vertikalt',
}

interface Props {
    label: string;
    verdi: string | number | undefined | null;
    sorteres?: OppsummeringsParSortering;
    textSomSmall?: boolean;
    className?: string;
}

export const OppsummeringPar = ({
    label,
    verdi,
    className = '',
    textSomSmall,
    sorteres = OppsummeringsParSortering.Horisontalt,
}: Props) => {
    if (sorteres === OppsummeringsParSortering.Vertikalt) {
        return (
            <div className={classNames(styles.oppsummeringspar2, className)}>
                <Label size={textSomSmall ? 'small' : undefined}>{label}</Label>
                <BodyShort size={textSomSmall ? 'small' : undefined}>{verdi ?? ''}</BodyShort>
            </div>
        );
    }
    return (
        <div className={classNames(styles.oppsummeringspar, className)}>
            <BodyShort size={textSomSmall ? 'small' : undefined}>{label}</BodyShort>
            <Label size={textSomSmall ? 'small' : undefined}>{verdi ?? ''}</Label>
        </div>
    );
};

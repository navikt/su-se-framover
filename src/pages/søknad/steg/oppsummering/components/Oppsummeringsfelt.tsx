import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const Oppsummeringsfelt = (props: {
    label: React.ReactNode;
    verdi: string | React.ReactNode;
    size?: 'small' | 'medium';
}) => (
    <div className={styles.oppsummeringsfelt}>
        <Label size={props.size}>{props.label}</Label>
        <BodyShort size={props.size}>{props.verdi}</BodyShort>
    </div>
);

import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const Oppsummeringsfelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Label>{props.label}</Label>
        <BodyShort>{props.verdi}</BodyShort>
    </div>
);

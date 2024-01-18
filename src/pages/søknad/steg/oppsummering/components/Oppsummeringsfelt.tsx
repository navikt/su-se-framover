import { BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react';

export const Oppsummeringsfelt = (props: {
    label: React.ReactNode;
    verdi: string | React.ReactNode;
    size?: 'small' | 'medium';
}) => (
    <div>
        <Label size={props.size}>{props.label}</Label>
        <BodyShort size={props.size}>{props.verdi}</BodyShort>
    </div>
);

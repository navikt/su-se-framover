import { BodyShort, Label } from '@navikt/ds-react';
import { ReactNode } from 'react';

export const Oppsummeringsfelt = (props: {
    label: ReactNode;
    verdi: string | ReactNode;
    size?: 'small' | 'medium';
}) => (
    <div>
        <Label size={props.size}>{props.label}</Label>
        <BodyShort size={props.size}>{props.verdi}</BodyShort>
    </div>
);

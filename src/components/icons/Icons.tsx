import { WarningFilled, SuccessFilled, ErrorFilled } from '@navikt/ds-icons';
import React from 'react';

const iconWidth = '1.5em';
interface Props {
    width?: string | number;
    className?: string;
}

export const SuccessIcon = (props: Props) => (
    <SuccessFilled
        className={props.className}
        fontSize={props.width ?? iconWidth}
        color="var(--navds-semantic-color-feedback-success-icon)"
    />
);

export const ErrorIcon = (props: Props) => (
    <ErrorFilled
        className={props.className}
        fontSize={props.width ?? iconWidth}
        color="var(--navds-semantic-color-feedback-danger-icon)"
    />
);

export const WarningIcon = (props: Props) => (
    <WarningFilled
        className={props.className}
        fontSize={props.width ?? iconWidth}
        color="var(--navds-semantic-color-feedback-warning-icon)"
    />
);

export const InformationIcon = (props: Props) => (
    <WarningFilled
        className={props.className}
        fontSize={props.width ?? iconWidth}
        color="var(--navds-semantic-color-feedback-info-icon);"
    />
);

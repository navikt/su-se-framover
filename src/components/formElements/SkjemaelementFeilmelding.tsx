import { Label } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { PropsWithChildren } from 'react';

interface SkjemaelementFeilmeldingProps extends PropsWithChildren {
    className?: string;
    children: React.ReactNode;
}

const SkjemaelementFeilmelding: React.FC<SkjemaelementFeilmeldingProps> = ({ className, children }) => {
    return (
        <Label as="div" className={classNames('navds-error-message', className)}>
            {children}
        </Label>
    );
};

export default SkjemaelementFeilmelding;

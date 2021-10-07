import { Label } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

interface SkjemaelementFeilmeldingProps {
    className?: string;
}

const SkjemaelementFeilmelding: React.FC<SkjemaelementFeilmeldingProps> = ({ className, children }) => {
    return (
        <Label as="div" className={classNames('navds-error-message', className)}>
            {children}
        </Label>
    );
};

export default SkjemaelementFeilmelding;

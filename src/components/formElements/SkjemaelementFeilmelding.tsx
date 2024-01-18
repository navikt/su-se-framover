import { Label } from '@navikt/ds-react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

interface SkjemaelementFeilmeldingProps extends PropsWithChildren {
    className?: string;
    children: ReactNode;
}

const SkjemaelementFeilmelding: FC<SkjemaelementFeilmeldingProps> = ({ className, children }) => {
    return (
        <Label as="div" className={classNames('navds-error-message', className)}>
            {children}
        </Label>
    );
};

export default SkjemaelementFeilmelding;

import { Button, ButtonProps } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props extends Omit<ButtonProps, 'onClick' | 'type'> {
    href: string;
}

export const LinkAsButton: React.FC<Props> = ({ href, children, ...buttonProps }) => {
    const navigate = useNavigate();

    return (
        <Button onClick={() => navigate(href)} type="button" {...buttonProps}>
            {children}
        </Button>
    );
};

export default LinkAsButton;

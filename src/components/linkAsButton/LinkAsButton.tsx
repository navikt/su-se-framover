import { Button, ButtonProps } from '@navikt/ds-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props extends Omit<ButtonProps, 'onClick' | 'type'> {
    href: string;
    state?: unknown;
    onClick?: () => void;
}

export const LinkAsButton: FC<Props> = ({ href, state, children, onClick, ...buttonProps }) => {
    const navigate = useNavigate();

    return (
        <Button onClick={() => navigate(href, { state })} type="button" {...buttonProps}>
            {children}
        </Button>
    );
};

export default LinkAsButton;

import { Button, ButtonProps } from '@navikt/ds-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props extends Omit<ButtonProps, 'onClick' | 'type'> {
    href: string;
    onClick?: () => void;
}

export const LinkAsButton: FC<Props> = ({ href, children, onClick, ...buttonProps }) => {
    const navigate = useNavigate();

    return (
        <Button onClick={() => navigate(href)} type="button" {...buttonProps}>
            {children}
        </Button>
    );
};

export default LinkAsButton;

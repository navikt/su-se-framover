import { Button, ButtonProps } from '@navikt/ds-react';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

interface Props extends Omit<ButtonProps, 'onClick' | 'type'> {
    href: string;
}

const LinkAsButton: React.FC<Props> = ({ href, children, ...buttonProps }) => {
    const history = useHistory();

    return (
        <Button
            onClick={() => {
                history.push(href);
            }}
            type="button"
            {...buttonProps}
        >
            {children}
        </Button>
    );
};

export default LinkAsButton;

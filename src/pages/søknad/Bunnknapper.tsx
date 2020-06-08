import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Knapp, Hovedknapp } from 'nav-frontend-knapper';
import { Søknadsteg } from './types';

const Bunnknapper = (props: {
    previous?: {
        label: React.ReactNode;
        steg: Søknadsteg;
        onClick: () => void;
    };
    next?: {
        label: React.ReactNode;
        steg: Søknadsteg;
        onClick: () => void;
    };
}) => {
    const history = useHistory();

    return (
        <div>
            {props.previous && (
                <Knapp
                    onClick={() => {
                        props.previous?.onClick();
                        history.push(`/soknad/${props.previous?.steg}`);
                    }}
                >
                    {props.previous.label}
                </Knapp>
            )}
            {props.next && (
                <Hovedknapp
                    onClick={() => {
                        props.next?.onClick();
                        history.push(`/soknad/${props.next?.steg}`);
                    }}
                >
                    {props.next.label}
                </Hovedknapp>
            )}
            <Knapp
                onClick={() => {
                    /* AVBRYT */
                    console.log('ABORT!');
                }}
            />
        </div>
    );
};

export default Bunnknapper;

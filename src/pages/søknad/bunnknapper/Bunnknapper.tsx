import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Knapp, Hovedknapp } from 'nav-frontend-knapper';
import { Søknadsteg } from '../types';
import TextProvider, { Languages } from '~components/TextProvider';
import messages from './bunnknapper-nb';
import { FormattedMessage } from 'react-intl';
import styles from './bunnknapper.module.less';

const Bunnknapper = (props: {
    previous?: {
        label?: React.ReactNode;
        steg: Søknadsteg;
        onClick: () => void;
    };
    next?: {
        label?: React.ReactNode;
        steg: Søknadsteg;
        onClick: () => void;
    };
}) => {
    const history = useHistory();

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={styles.container}>
                {props.previous && (
                    <Knapp
                        className={styles.navKnapp}
                        onClick={() => {
                            props.previous?.onClick();
                            history.push(`/soknad/${props.previous?.steg}`);
                        }}
                    >
                        {props.previous.label ?? <FormattedMessage id="steg.forrige" />}
                    </Knapp>
                )}
                {props.next && (
                    <Hovedknapp
                        className={styles.navKnapp}
                        onClick={() => {
                            props.next?.onClick();
                            history.push(`/soknad/${props.next?.steg}`);
                        }}
                    >
                        {props.next.label ?? <FormattedMessage id="steg.neste" />}
                    </Hovedknapp>
                )}
                {/* <Knapp
                    onClick={() => {
                        console.log('ABORT!');
                    }}
                /> */}
            </div>
        </TextProvider>
    );
};

export default Bunnknapper;

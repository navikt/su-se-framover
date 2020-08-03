import { Knapp, Hovedknapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import TextProvider, { Languages } from '~components/TextProvider';

import messages from './bunnknapper-nb';
import styles from './bunnknapper.module.less';

const Bunnknapper = (props: {
    previous?: {
        label?: React.ReactNode;
        onClick: () => void;
    };
    next?: {
        label?: React.ReactNode;
    };
}) => (
    <TextProvider messages={{ [Languages.nb]: messages }}>
        <div className={styles.container}>
            <Hovedknapp htmlType="submit" className={styles.navKnapp}>
                {props.next?.label ?? <FormattedMessage id="steg.neste" />}
            </Hovedknapp>
            {props.previous && (
                <Knapp
                    htmlType="button"
                    className={styles.navKnapp}
                    onClick={() => {
                        props.previous?.onClick();
                    }}
                >
                    {props.previous.label ?? <FormattedMessage id="steg.forrige" />}
                </Knapp>
            )}
        </div>
    </TextProvider>
);

export default Bunnknapper;

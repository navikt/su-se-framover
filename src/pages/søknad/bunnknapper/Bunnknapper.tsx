import { Knapp, Hovedknapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

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
    avbryt: {
        toRoute: string;
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
        <Link className={styles.avbrytknappContainer} to={props.avbryt.toRoute}>
            <Undertittel>
                <FormattedMessage id="steg.avbryt" />
            </Undertittel>
        </Link>
    </TextProvider>
);

export default Bunnknapper;

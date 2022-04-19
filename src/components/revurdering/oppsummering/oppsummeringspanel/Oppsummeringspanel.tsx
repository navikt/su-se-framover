import { Calculator, List } from '@navikt/ds-icons';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import * as styles from './oppsummeringspanel.module.less';

export enum Oppsummeringsikon {
    Liste,
    Kalkulator,
}
export enum Oppsummeringsfarge {
    Lilla,
    Grønn,
}

function fargeklassenavn(farge: Oppsummeringsfarge) {
    switch (farge) {
        case Oppsummeringsfarge.Lilla:
            return styles.lilla;
        case Oppsummeringsfarge.Grønn:
            return styles.grønn;
    }
}

const Ikon = (props: { className?: string; ikon: Oppsummeringsikon }) => {
    const iconProps = {
        className: props.className,
        style: {
            fontSize: '1.5rem',
        },
        role: 'img',
        focusable: false,
    };

    switch (props.ikon) {
        case Oppsummeringsikon.Kalkulator:
            return <Calculator {...iconProps} aria-label="Kalkulatorikon" />;
        case Oppsummeringsikon.Liste:
            return <List {...iconProps} aria-label="Listeikon" />;
    }
};

const Oppsummeringspanel = (props: {
    ikon: Oppsummeringsikon;
    farge: Oppsummeringsfarge;
    tittel: string;
    children: React.ReactNode;
}) => (
    <div className={styles.container}>
        <div className={classNames(styles.tittel, fargeklassenavn(props.farge))}>
            <Ikon className={styles.ikon} ikon={props.ikon} />
            <Heading level="2" size="medium">
                {props.tittel}
            </Heading>
        </div>
        <div className={styles.content}>{props.children}</div>
    </div>
);

export default Oppsummeringspanel;

import { Calculator, List, FillForms, Task, FileError, Money, Email } from '@navikt/ds-icons';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import * as styles from './oppsummeringspanel.module.less';

export enum Oppsummeringsikon {
    Liste,
    Kalkulator,
    Blyant,
    Task,
    FilError,
    Lommebok,
    Email,
}
export enum Oppsummeringsfarge {
    Lilla,
    Grønn,
    Blå,
    Limegrønn,
}

function fargeklassenavn(farge: Oppsummeringsfarge) {
    switch (farge) {
        case Oppsummeringsfarge.Lilla:
            return styles.lilla;
        case Oppsummeringsfarge.Grønn:
            return styles.grønn;
        case Oppsummeringsfarge.Blå:
            return styles.blå;
        case Oppsummeringsfarge.Limegrønn:
            return styles.limegrønn;
    }
}

const Ikon = (props: { className?: string; ikon: Oppsummeringsikon }) => {
    const iconProps = {
        className: props.className,
        style: { fontSize: '1.5rem' },
        role: 'img',
        focusable: false,
    };

    switch (props.ikon) {
        case Oppsummeringsikon.Kalkulator:
            return <Calculator {...iconProps} aria-label="Kalkulatorikon" />;
        case Oppsummeringsikon.Liste:
            return <List {...iconProps} aria-label="Listeikon" />;
        case Oppsummeringsikon.Blyant:
            return <FillForms {...iconProps} aria-label="Blyantikon" />;
        case Oppsummeringsikon.Task:
            return <Task {...iconProps} aria-label="Oppgaveliste-ikon" />;
        case Oppsummeringsikon.FilError:
            return <FileError {...iconProps} aria-label="Fil-error-ikon" />;
        case Oppsummeringsikon.Lommebok:
            return <Money {...iconProps} aria-label="Lommebok-ikon" />;
        case Oppsummeringsikon.Email:
            return <Email {...iconProps} aria-label="brev-ikon" />;
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

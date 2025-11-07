import {
    BulletListIcon,
    CalculatorIcon,
    EnvelopeClosedIcon,
    FileXMarkIcon,
    PencilWritingIcon,
    TasklistIcon,
    WalletIcon,
} from '@navikt/aksel-icons';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { ReactNode } from 'react';

import styles from './oppsummeringspanel.module.less';

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
        style: { fontSize: '1.8rem' },
        role: 'img',
        focusable: false,
    };

    switch (props.ikon) {
        case Oppsummeringsikon.Kalkulator:
            return <CalculatorIcon {...iconProps} aria-label="Kalkulatorikon" />;
        case Oppsummeringsikon.Liste:
            return <BulletListIcon {...iconProps} aria-label="Listeikon" />;
        case Oppsummeringsikon.Blyant:
            return <PencilWritingIcon {...iconProps} aria-label="Blyantikon" />;
        case Oppsummeringsikon.Task:
            return <TasklistIcon {...iconProps} aria-label="Oppgaveliste-ikon" />;
        case Oppsummeringsikon.FilError:
            return <FileXMarkIcon {...iconProps} aria-label="Fil-error-ikon" />;
        case Oppsummeringsikon.Lommebok:
            return <WalletIcon {...iconProps} aria-label="Lommebok-ikon" />;
        case Oppsummeringsikon.Email:
            return <EnvelopeClosedIcon {...iconProps} aria-label="brev-ikon" />;
    }
};

const Oppsummeringspanel = (props: {
    ikon: Oppsummeringsikon;
    farge: Oppsummeringsfarge;
    tittel: string;
    children: ReactNode;
    className?: string;
    classNameChildren?: string;
    kompakt?: boolean;
}) => (
    <div className={classNames(styles.container, props.className)}>
        <div
            className={classNames(
                { [styles.tittel_kompakt]: props.kompakt, [styles.tittel]: !props.kompakt },
                fargeklassenavn(props.farge),
            )}
        >
            <Ikon className={styles.ikon} ikon={props.ikon} />
            <Heading size={props.kompakt ? 'xsmall' : 'medium'}>{props.tittel}</Heading>
        </div>
        <div className={classNames(styles.content, props.classNameChildren)}>{props.children}</div>
    </div>
);

export default Oppsummeringspanel;

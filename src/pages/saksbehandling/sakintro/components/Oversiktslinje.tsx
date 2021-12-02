import { Heading, Panel, Label, BodyShort } from '@navikt/ds-react';
import React from 'react';

import styles from './oversiktslinje.module.less';

interface Props<T> {
    entries: T[];
    kategoriTekst: string;
    children: {
        oversiktsinformasjon: (entry: T) => JSX.Element;
        knapper: (entry: T) => JSX.Element;
    };
}

interface Oversiktsinformasjon<T> {
    label: string;
    value: (entry: T) => string;
}
export const Informasjonslinje = <T extends object>(props: Oversiktsinformasjon<T>, entry: T) => (
    <div className={styles.informasjonslinje}>
        <Label>{props.label + ':'}</Label>
        <BodyShort>{props.value(entry)}</BodyShort>
    </div>
);

const Oversiktslinje = <T extends { id: string }>(props: Props<T>) => {
    if (props.entries.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <Heading level="2" size="medium" spacing>
                {props.kategoriTekst}
            </Heading>
            <ol>
                {props.entries.map((v) => {
                    return (
                        <li key={v.id}>
                            <Panel border className={styles.entry}>
                                <div className={styles.informasjonslinje}>{props.children.oversiktsinformasjon(v)}</div>
                                <div className={styles.knapper}>{props.children.knapper(v)}</div>
                            </Panel>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default Oversiktslinje;

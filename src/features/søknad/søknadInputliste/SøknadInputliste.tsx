/* eslint-disable react/display-name */
import { DeleteFilled } from '@navikt/ds-icons';
import { Button, OverridableComponent, Panel } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import styles from './søknadInputliste.module.less';

interface SøknadInputlisteProps {
    children: React.ReactNode[];
    leggTilLabel: React.ReactNode;
    className?: string;
    onLeggTilClick(): void;
}

type SøknadInputlisteItemComponent = OverridableComponent<
    {
        children: React.ReactNode;
        onFjernClick(): void;
    },
    HTMLDivElement
>;

interface SøknadInputlisteComponent
    extends React.ForwardRefExoticComponent<SøknadInputlisteProps & React.RefAttributes<HTMLDivElement>> {
    Item: SøknadInputlisteItemComponent;
}

const SøknadInputliste = React.forwardRef((props, ref) => (
    <div ref={ref} className={props.className}>
        <ol className={styles.liste}>
            {React.Children.map(props.children, (c, idx) => (
                <Panel as="li" key={idx} border className={styles.panel}>
                    {c}
                </Panel>
            ))}
        </ol>
        <Button variant="secondary" type="button" onClick={props.onLeggTilClick}>
            {props.leggTilLabel}
        </Button>
    </div>
)) as SøknadInputlisteComponent;

const Listeelement: SøknadInputlisteItemComponent = React.forwardRef(
    ({ as: Component = 'div', children, onFjernClick, className, ...rest }, ref) => (
        <Component ref={ref} className={classNames(styles.itemContainer, className)} {...rest}>
            <div className={styles.itemContent}>{children}</div>
            <div className={styles.slettContainer}>
                <Button variant="tertiary" type="button" onClick={onFjernClick} className={styles.slettknapp}>
                    Fjern <DeleteFilled />
                </Button>
            </div>
        </Component>
    )
);

SøknadInputliste.Item = Listeelement;

export default SøknadInputliste;

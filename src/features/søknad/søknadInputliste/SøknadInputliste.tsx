/* eslint-disable react/display-name */
import { TrashIcon } from '@navikt/aksel-icons';
import { Button, OverridableComponent, Panel } from '@navikt/ds-react';
import classNames from 'classnames';
import { Children, ForwardRefExoticComponent, forwardRef, ReactNode, RefAttributes } from 'react';

import styles from './søknadInputliste.module.less';

interface SøknadInputlisteProps {
    children: ReactNode[];
    leggTilLabel: ReactNode;
    className?: string;
    onLeggTilClick(): void;
}

type SøknadInputlisteItemComponent = OverridableComponent<
    {
        children: ReactNode;
        onFjernClick(): void;
    },
    HTMLDivElement
>;

interface SøknadInputlisteComponent
    extends ForwardRefExoticComponent<SøknadInputlisteProps & RefAttributes<HTMLDivElement>> {
    Item: SøknadInputlisteItemComponent;
}

const SøknadInputliste = forwardRef((props, ref) => (
    <div ref={ref} className={props.className}>
        <ol className={styles.liste}>
            {Children.map(props.children, (c, idx) => (
                <Panel as="li" key={idx} border>
                    {c}
                </Panel>
            ))}
        </ol>
        <Button variant="secondary" type="button" onClick={props.onLeggTilClick}>
            {props.leggTilLabel}
        </Button>
    </div>
)) as SøknadInputlisteComponent;

const Listeelement: SøknadInputlisteItemComponent = forwardRef(
    ({ as: Component = 'div', children, onFjernClick, className, ...rest }, ref) => (
        <Component ref={ref} className={classNames(styles.itemContainer, className)} {...rest}>
            <div className={styles.itemContent}>{children}</div>
            <div className={styles.slettContainer}>
                <Button variant="tertiary" type="button" onClick={onFjernClick}>
                    Fjern <TrashIcon />
                </Button>
            </div>
        </Component>
    ),
);

SøknadInputliste.Item = Listeelement;

export default SøknadInputliste;

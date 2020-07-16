import React, { useState } from 'react';
import Chevron from 'nav-frontend-chevron';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';
import styles from './menyknapp.module.less';
import { Knapp } from 'nav-frontend-knapper';

interface Props {
    navn: string;
    onLoggUtClick: () => void;
}
const Menyknapp = ({ navn, onLoggUtClick }: Props) => {
    const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined);
    return (
        <div>
            <button className={styles.menyknapp} onClick={(e) => setAnchor(e.currentTarget)}>
                <p>{navn}</p>
                <div className={styles.chevron}>
                    <Chevron type="ned" />
                </div>
            </button>
            <Popover
                ankerEl={anchor}
                onRequestClose={() => setAnchor(undefined)}
                orientering={PopoverOrientering.Under}
                autoFokus
                tabIndex={-1}
            >
                <div>
                    <Knapp onClick={onLoggUtClick} type="flat">
                        Logg ut
                    </Knapp>
                </div>
            </Popover>
        </div>
    );
};
export default Menyknapp;

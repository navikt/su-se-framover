import Chevron from 'nav-frontend-chevron';
import { Knapp } from 'nav-frontend-knapper';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';
import React, { useState } from 'react';

import styles from './menyknapp.module.less';

interface Props {
    navn: string;
    onLoggUtClick: () => void;
}
const Menyknapp = ({ navn, onLoggUtClick }: Props) => {
    const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined);
    return (
        <div>
            <button
                className={styles.menyknapp}
                onClick={(e) => (anchor ? setAnchor(undefined) : setAnchor(e.currentTarget))}
            >
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

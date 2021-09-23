import { ExpandFilled } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
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
                <ExpandFilled />
            </button>
            <Popover
                ankerEl={anchor}
                onRequestClose={() => setAnchor(undefined)}
                orientering={PopoverOrientering.Under}
                autoFokus
                tabIndex={-1}
            >
                <div>
                    <Button variant="tertiary" onClick={onLoggUtClick}>
                        Logg ut
                    </Button>
                </div>
            </Popover>
        </div>
    );
};
export default Menyknapp;

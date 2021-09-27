import { ExpandFilled } from '@navikt/ds-icons';
import { Button, Popover } from '@navikt/ds-react';
import React, { useState } from 'react';

import styles from './menyknapp.module.less';

interface Props {
    navn: string;
    onLoggUtClick: () => void;
}
const Menyknapp = ({ navn, onLoggUtClick }: Props) => {
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                className={styles.menyknapp}
                onClick={() => {
                    setOpen((o) => !o);
                }}
                ref={anchorRef}
            >
                <p>{navn}</p>
                <ExpandFilled />
            </button>
            <Popover anchorEl={anchorRef.current} onClose={() => setOpen(false)} open={open} placement="top-start">
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

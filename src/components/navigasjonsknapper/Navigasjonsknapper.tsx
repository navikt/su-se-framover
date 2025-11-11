import { Button } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import styles from './navigasjonsknapper.module.less';
import messages from './navigasjonsknapper-nb';

/**
 * Navigering til url tar alltid presedens over onClick hvis begge er supplert.
 * Bruk heller bare et av verdiene istedenfor
 */
const Navigasjonsknapper = (props: {
    neste?: {
        loading?: boolean;
        tekst?: string;
        onClick?: () => void;
        disabled?: boolean;
    };
    tilbake?: {
        url?: string;
        onClick?: () => void;
    };
    fortsettSenere?: {
        loading?: boolean;
        onClick?: () => void;
        tekst?: string;
    };
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'avslutt' | undefined>(undefined);

    const Tilbake = () => {
        const { tilbake } = props;
        const tilbakeknapp = (onClick: () => void) => (
            <Button onClick={onClick} variant="secondary" type="button">
                {formatMessage('knapp.tilbake')}
            </Button>
        );
        return tilbakeknapp(() =>
            tilbake?.url ? navigate(tilbake.url) : tilbake?.onClick ? tilbake.onClick() : () => void 0,
        );
    };

    return (
        <div>
            <div className={styles.navigationButtonContainer}>
                {props.fortsettSenere ? (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setKnappTrykket('avslutt');
                            props.fortsettSenere?.onClick?.();
                        }}
                        type="button"
                        loading={props.fortsettSenere?.loading ?? (knappTrykket === 'avslutt' && props.neste?.loading)}
                    >
                        {props.fortsettSenere?.tekst ?? formatMessage('knapp.lagreOgfortsettSenere')}
                    </Button>
                ) : (
                    <Tilbake />
                )}
                <Button
                    onClick={() => {
                        setKnappTrykket('neste');
                        props.neste?.onClick?.();
                    }}
                    type={props.neste?.onClick ? 'button' : 'submit'}
                    loading={knappTrykket === 'neste' && props.neste?.loading}
                    disabled={props.neste?.disabled}
                >
                    {props.neste?.tekst ? props.neste?.tekst : formatMessage('knapp.neste')}
                </Button>
            </div>
            <div className={styles.navigationButtonContainer}>{props.fortsettSenere && <Tilbake />}</div>
        </div>
    );
};

export default Navigasjonsknapper;

import { Button, Loader } from '@navikt/ds-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Beregningblokk from '~src/components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import StansOppsummeringsblokk from '~src/components/revurdering/oppsummering/stansoppsummeringsblokk/stans/stansoppsummeringsblokk';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { Revurdering } from '~src/types/Revurdering';

import messages from '../stans-nb';
import * as styles from '../stans.module.less';

interface KnappProps {
    tekst: string;
    onClick: () => void;
    spinner?: boolean;
}
interface Input {
    label: string;
    verdi: string;
}
interface Props {
    revurdering: Revurdering;
    knapper?: { tilbake?: KnappProps; neste?: KnappProps };
    error?: Nullable<ApiError>;
    inputs: Input[];
}

const StansOppsummeringskomponent = (props: Props) => {
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const navigate = useNavigate();

    const { revurdering, inputs, error, knapper } = props;

    return (
        <div className={styles.stansOppsummering}>
            <div className={styles.oppsummering}>
                <StansOppsummeringsblokk tittel="Oppsummering" oppsummeringsinput={inputs} />
            </div>
            <Beregningblokk revurdering={revurdering} />
            {error && (
                <div className={styles.error}>
                    <ApiErrorAlert error={error} />
                </div>
            )}
            <div className={styles.iverksett}>
                <Button
                    variant="secondary"
                    onClick={() => {
                        knapper?.tilbake?.onClick ? knapper.tilbake.onClick() : navigate(-1);
                    }}
                >
                    {knapper?.tilbake?.tekst ?? intl.formatMessage({ id: 'stans.bunnknapper.tilbake' })}
                    {knapper?.tilbake?.spinner && <Loader />}
                </Button>
                {knapper?.neste && (
                    <Button variant="secondary" onClick={knapper?.neste.onClick}>
                        {knapper.neste.tekst}
                        {knapper?.neste.spinner && <Loader />}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default StansOppsummeringskomponent;

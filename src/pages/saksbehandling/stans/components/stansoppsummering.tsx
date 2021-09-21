import { Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useHistory } from 'react-router';

import { ApiError } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Beregningblokk from '~components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/i18n';
import StansVedtakOppsummering from '~pages/saksbehandling/vedtak/stans/stansvedtaksoppsummering';
import { Revurdering } from '~types/Revurdering';

import messages from '../stans-nb';
import styles from '../stans.module.less';

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
    error?: ApiError<string>;
    inputs: Input[];
}

const StansOppsummering = (props: Props) => {
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const history = useHistory();

    const { revurdering, inputs, error, knapper } = props;

    return (
        <div className={styles.stansOppsummering}>
            <StansVedtakOppsummering tittel="Oppsummering" oppsummeringsinput={inputs} />
            <Beregningblokk revurdering={revurdering} />
            {error && (
                <div className={styles.error}>
                    <ApiErrorAlert error={error} />
                </div>
            )}
            <div className={styles.iverksett}>
                <Knapp spinner={knapper?.neste?.spinner} onClick={knapper?.tilbake?.onClick ?? history.goBack}>
                    {knapper?.tilbake?.tekst ?? intl.formatMessage({ id: 'stans.bunnknapper.tilbake' })}
                </Knapp>
                {knapper?.neste && (
                    <Knapp spinner={knapper?.neste.spinner} onClick={knapper?.neste.onClick}>
                        {knapper.neste.tekst}
                    </Knapp>
                )}
            </div>
        </div>
    );
};

export default StansOppsummering;

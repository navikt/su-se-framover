import { Alert, Button } from '@navikt/ds-react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import OppsummeringAvKlage from '~src/components/oppsummeringAvKlage/OppsummeringAvKlage';
import OppsummeringAvVedtak from '~src/components/oppsummeringAvVedtak/OppsummeringAvVedtak';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { erKlageOversendt } from '~src/utils/klage/klageUtils';

import messages from './VedtakEllerOversendtKlageOppsummering-nb';
import * as styles from './VedtakEllerOversendtKlageOppsummering.module.less';

const VedtakEllerOversendtKlageOppsummering = (props: {
    vedtakEllerOversendtKlageId?: string;
    ikkeVisTilbakeKnapp?: boolean;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();

    const behandlingId = props.vedtakEllerOversendtKlageId ?? urlParams.vedtakId;

    const klage = sak.klager.find((k) => k.id === behandlingId);

    if (klage && erKlageOversendt(klage)) {
        const klagensVedtak = sak.vedtak.find((v) => v.id === klage.vedtakId)!;
        return (
            <div>
                <OppsummeringAvKlage klage={klage} klagensVedtak={klagensVedtak} />
                {!props.ikkeVisTilbakeKnapp && (
                    <Button
                        variant="secondary"
                        type="button"
                        className={styles.tilbakeKnapp}
                        onClick={() => navigate(-1)}
                    >
                        {formatMessage('knapp.tilbake')}
                    </Button>
                )}
            </div>
        );
    }

    const vedtak = sak.vedtak.find((v) => v.id === behandlingId);
    if (!vedtak) {
        return <Alert variant="error">{formatMessage('feilmelding.fantIkkeVedtak')}</Alert>;
    }

    return (
        <div>
            <OppsummeringAvVedtak vedtak={vedtak} />
            {!props.ikkeVisTilbakeKnapp && (
                <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
        </div>
    );
};

export default VedtakEllerOversendtKlageOppsummering;

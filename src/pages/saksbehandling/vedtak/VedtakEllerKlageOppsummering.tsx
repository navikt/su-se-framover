import { Alert, Button } from '@navikt/ds-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import OppsummeringAvKlage from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import OppsummeringAvVedtak from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { klageErOversendtEllerFerdigstilt } from '~src/utils/klage/klageUtils';

import messages from './VedtakEllerOversendtKlageOppsummering-nb';
import styles from './VedtakEllerOversendtKlageOppsummering.module.less';

/*
    Klagene som kan bli vist frem her er de som er oversendt eller ferdigstilt.
 */
const VedtakEllerKlageOppsummering = (props: {
    vedtakEllerOversendtKlageId?: string;
    ikkeVisTilbakeKnapp?: boolean;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.vedtakEllerKlageOppsummering>();

    const behandlingId = props.vedtakEllerOversendtKlageId ?? urlParams.vedtakEllerKlageId;

    const klage = sak.klager.find((k) => k.id === behandlingId);

    if (klage && klageErOversendtEllerFerdigstilt(klage)) {
        const klagensVedtak = sak.vedtak.find((v) => v.id === klage.vedtakId)!;
        return (
            <div className={styles.pageContainer}>
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
        <div className={styles.pageContainer}>
            <OppsummeringAvVedtak vedtak={vedtak} />
            {!props.ikkeVisTilbakeKnapp && (
                <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
        </div>
    );
};

export default VedtakEllerKlageOppsummering;

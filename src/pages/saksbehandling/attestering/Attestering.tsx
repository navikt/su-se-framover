import { Alert, Heading } from '@navikt/ds-react';
import { Link, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { erInformasjonsRevurdering } from '~src/utils/revurdering/revurderingUtils';

import messages from './Attestering-nb';
import styles from './Attestering.module.less';
import AttesterKlage from './attesterKlage/AttesterKlage';
import AttesterRevurdering from './attesterRevurdering/AttesterRevurdering';
import AttesterSøknadsbehandling from './attesterSøknadsbehandling/AttesterSøknadsbehandling';
import AttesterTilbakekreving from './attesterTilbakekreving/AttesterTilbakekreving';

const Attestering = () => {
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();

    const søknadsbehandling = sak.behandlinger.find((s) => s.id === urlParams.behandlingId);
    const revurdering = sak.revurderinger.find((r) => r.id === urlParams.behandlingId);
    const klage = sak.klager.find((k) => k.id === urlParams.behandlingId);
    const tilbakekreving = sak.tilbakekrevinger.find((t) => t.id === urlParams.behandlingId);

    if (!søknadsbehandling && !revurdering && !klage && !tilbakekreving) {
        return (
            <div>
                <Alert variant="error">
                    {formatMessage('feil.fantIkkebehandlingMedId')} {urlParams.behandlingId}
                </Alert>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: sak.id,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading level="1" size="large" className={styles.heading}>
                    {formatMessage('page.tittel')}
                </Heading>
            </div>
            {søknadsbehandling && <AttesterSøknadsbehandling sak={sak} søknadsbehandling={søknadsbehandling} />}
            {revurdering && erInformasjonsRevurdering(revurdering) && (
                <AttesterRevurdering
                    sakInfo={{ id: sak.id, nummer: sak.saksnummer, sakstype: sak.sakstype }}
                    revurdering={revurdering}
                />
            )}
            {klage && (
                <AttesterKlage
                    sakId={sak.id}
                    klage={klage}
                    klagensVedtak={sak.vedtak.find((v) => v.id === klage.vedtakId)!}
                />
            )}
            {tilbakekreving && <AttesterTilbakekreving saksversjon={sak.versjon} behandling={tilbakekreving} />}
        </div>
    );
};

export default Attestering;

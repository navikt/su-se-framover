import { Alert, Heading } from '@navikt/ds-react';
import { Link, useOutletContext } from 'react-router-dom';
import NotatPanel from '~src/components/notat/NotatPanel.tsx';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { ReferanseType } from '~src/types/Notat.ts';
import { erInformasjonsRevurdering } from '~src/utils/revurdering/revurderingUtils';
import {
    erRevurderingAvsluttet,
    erRevurderingIverksatt,
    erRevurderingTilAttestering,
} from '~src/utils/revurdering/revurderingUtils.ts';
import { erIverksatt, erSøknadsbehandlingTilAttestering } from '~src/utils/SøknadsbehandlingUtils.ts';
import styles from './Attestering.module.less';
import messages from './Attestering-nb';
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
    const harUteståendeKravgrunnlag = !!sak.uteståendeKravgrunnlag;
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
            {søknadsbehandling && (
                <NotatPanel
                    sakId={sak.id}
                    referanseId={søknadsbehandling.id}
                    referanseType={ReferanseType.SØKNAD}
                    underAttestering={erSøknadsbehandlingTilAttestering(søknadsbehandling)}
                    kanRedigere={!erIverksatt(søknadsbehandling) && !søknadsbehandling.erLukket}
                />
            )}
            {revurdering && (
                <NotatPanel
                    sakId={sak.id}
                    referanseId={revurdering.id}
                    referanseType={ReferanseType.REVURDERING}
                    underAttestering={erRevurderingTilAttestering(revurdering)}
                    kanRedigere={!erRevurderingIverksatt(revurdering) && !erRevurderingAvsluttet(revurdering)}
                />
            )}
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
                    harUteståendeKravgrunnlag={harUteståendeKravgrunnlag}
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

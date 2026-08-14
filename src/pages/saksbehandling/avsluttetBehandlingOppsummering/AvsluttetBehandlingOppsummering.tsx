import { Alert, BodyLong, Button } from '@navikt/ds-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import NotatPanel from '~src/components/notat/NotatPanel.tsx';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { ReferanseType } from '~src/types/Notat.ts';

import styles from './AvsluttetBehandlingOppsummering.module.less';
import messages from './AvsluttetBehandlingOppsummering-nb';

const AvsluttetBehandlingOppsummering = () => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const { id, type } = Routes.useRouteParams<typeof Routes.avsluttetBehandlingOppsummering>();

    const søknad = type === Routes.AvsluttBehandlingType.SØKNAD ? sak.søknader.find((s) => s.id === id) : undefined;
    const søknadsbehandling =
        type === Routes.AvsluttBehandlingType.SØKNADSBEHANDLING ? sak.behandlinger.find((s) => s.id === id) : undefined;
    const revurdering =
        type === Routes.AvsluttBehandlingType.REVURDERING ? sak.revurderinger.find((r) => r.id === id) : undefined;
    const klage = type === Routes.AvsluttBehandlingType.KLAGE ? sak.klager.find((k) => k.id === id) : undefined;
    const tilbakekreving =
        type === Routes.AvsluttBehandlingType.TILBAKEKREVING
            ? sak.tilbakekrevinger.find((t) => t.id === id)
            : undefined;

    const funnet = søknad ?? søknadsbehandling ?? revurdering ?? klage ?? tilbakekreving;
    if (!funnet) {
        return (
            <Alert variant="error">
                {formatMessage('feil.fantIkkeBehandling')} {id}
            </Alert>
        );
    }

    const notatReferanse = (() => {
        if (søknad) return { referanseId: søknad.id, referanseType: ReferanseType.SØKNAD };
        if (søknadsbehandling)
            return { referanseId: søknadsbehandling.id, referanseType: ReferanseType.SØKNADSBEHANDLING };
        if (revurdering) return { referanseId: revurdering.id, referanseType: ReferanseType.REVURDERING };
        if (klage) return { referanseId: klage.id, referanseType: ReferanseType.KLAGE };
        return null;
    })();

    const lukketType = søknad?.lukket?.type ?? søknadsbehandling?.søknad?.lukket?.type;

    const begrunnelse = revurdering?.begrunnelse ?? klage?.avsluttetBegrunnelse ?? tilbakekreving?.avbruttBegrunnelse;

    return (
        <div className={styles.pageContainer}>
            {notatReferanse && (
                <NotatPanel
                    sakId={sak.id}
                    referanseId={notatReferanse.referanseId}
                    referanseType={notatReferanse.referanseType}
                    underAttestering={false}
                    kanRedigere={false}
                />
            )}

            {lukketType && (
                <div className={styles.infoPanel}>
                    <Oppsummeringspanel
                        ikon={Oppsummeringsikon.Task}
                        farge={Oppsummeringsfarge.Lilla}
                        tittel={formatMessage('panel.utfall.tittel')}
                    >
                        <BodyLong>{formatMessage(`lukket.${lukketType}`)}</BodyLong>
                    </Oppsummeringspanel>
                </div>
            )}

            {(revurdering || klage || tilbakekreving) && (
                <div className={styles.infoPanel}>
                    <Oppsummeringspanel
                        ikon={Oppsummeringsikon.Blyant}
                        farge={Oppsummeringsfarge.Lilla}
                        tittel={formatMessage('panel.begrunnelse.tittel')}
                    >
                        <BodyLong>{begrunnelse ?? formatMessage('panel.begrunnelse.ingenBegrunnelse')}</BodyLong>
                    </Oppsummeringspanel>
                </div>
            )}

            <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                {formatMessage('knapp.tilbake')}
            </Button>
        </div>
    );
};

export default AvsluttetBehandlingOppsummering;

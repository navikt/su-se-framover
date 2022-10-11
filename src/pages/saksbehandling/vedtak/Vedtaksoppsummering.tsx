import { Button } from '@navikt/ds-react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import OppsummeringAvKlage from '~src/components/oppsummeringAvKlage/OppsummeringAvKlage';
import OppsummeringAvRevurderingsvedtak from '~src/components/oppsummeringAvRevurdering/OppsummeringAvRevurderingsvedtak';
import Søknadsbehandlingoppsummering from '~src/components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Sak } from '~src/types/Sak';
import { VedtakType } from '~src/types/Vedtak';
import { erKlageFerdigbehandlet } from '~src/utils/klage/klageUtils';

import Klagevedtaksoppsummering from './klagevedtaksoppsummering/klagevedtaksoppsummering';
import ReguleringVedtaksoppsummering from './reguleringsvedtaksoppsummering/reguleringVedtaksoppsummering';
import messages from './vedtaksoppsummering-nb';
import * as styles from './vedtaksoppsummering.module.less';

export function hentKlagevedtakFraKlageinstans(sak: Sak, klageId: string | undefined) {
    const klageMedKlageinstansvedtak = sak.klager.find((k) => k.id === klageId);
    if (klageMedKlageinstansvedtak && erKlageFerdigbehandlet(klageMedKlageinstansvedtak)) {
        const vedtakSomKlagesPå = sak.vedtak.find((v) => v.id === klageMedKlageinstansvedtak.vedtakId)!;
        return {
            klage: klageMedKlageinstansvedtak,
            vedtak: vedtakSomKlagesPå,
        };
    }

    return null;
}

const Vedtaksoppsummering = (props: { vedtakId?: string; ikkeVisTilbakeKnapp?: boolean }) => {
    const contextProps = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();

    const vedtakId = props.vedtakId ?? urlParams.vedtakId;
    const vedtak = contextProps.sak.vedtak.find((v) => v.id === vedtakId);

    const klageVedtak = hentKlagevedtakFraKlageinstans(contextProps.sak, vedtakId);

    if (klageVedtak) {
        return <OppsummeringAvKlage klage={klageVedtak.klage} klagensVedtak={klageVedtak.vedtak} />;
    }

    const Oppsummering = (): JSX.Element => {
        switch (vedtak?.type) {
            case VedtakType.AVVIST_KLAGE:
                return (
                    <Klagevedtaksoppsummering
                        vedtak={vedtak}
                        klage={contextProps.sak.klager.find((k) => k.id === vedtak.behandlingId)!}
                    />
                );
            case VedtakType.STANS_AV_YTELSE:
            case VedtakType.GJENOPPTAK_AV_YTELSE:
            case VedtakType.ENDRING:
            case VedtakType.INGEN_ENDRING:
            case VedtakType.OPPHØR:
                return <OppsummeringAvRevurderingsvedtak sak={contextProps.sak} vedtak={vedtak} />;
            case VedtakType.REGULERING:
                return (
                    <ReguleringVedtaksoppsummering
                        sakId={contextProps.sak.id}
                        vedtak={vedtak}
                        regulering={contextProps.sak.reguleringer.find((r) => r.id === vedtak.behandlingId)!}
                    />
                );
            case VedtakType.AVSLAG:
            case VedtakType.SØKNAD:
                return (
                    <Søknadsbehandlingoppsummering
                        sak={contextProps.sak}
                        behandling={contextProps.sak.behandlinger.find((b) => b.id === vedtak.behandlingId)!}
                        vedtakForBehandling={vedtak}
                        medBrevutkastknapp
                    />
                );
            case undefined:
                return <div>{formatMessage('feilmelding.fantIkkeVedtak')}</div>;
        }
    };

    return (
        <div className={styles.container}>
            <Oppsummering />
            {!props.ikkeVisTilbakeKnapp && (
                <Button variant="secondary" type="button" className={styles.tilbakeKnapp} onClick={() => navigate(-1)}>
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
        </div>
    );
};

export default Vedtaksoppsummering;

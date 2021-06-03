import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as PdfApi from '~api/pdfApi';
import { useUserContext } from '~context/userContext';
import { erIverksatt } from '~features/behandling/behandlingUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { søknadMottatt } from '~lib/søknadUtils';
import { Behandling, Behandlingsstatus, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';

import VisBeregningOgSimulering from '../steg/beregningOgSimulering/BeregningOgSimulering';
import VilkårsOppsummering from '../vilkårsOppsummering/VilkårsOppsummering';

import messages from './behandlingsoppsummering-nb';
import styles from './behandlingsoppsummering.module.less';

const iconWidth = '24px';

interface Props {
    sak: Sak;
}

const Behandlingsoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak.behandlinger.find((behandling) => behandling.id === urlParams.behandlingId);
    const vedtakForBehandling = props.sak.vedtak.find((v) => v.behandlingId === behandling?.id);
    const intl = useI18n({ messages });

    if (!behandling) {
        return <></>;
    }

    return (
        <div className={styles.oppsummeringContainer}>
            <BehandlingStatus
                sakId={props.sak.id}
                behandling={behandling}
                vedtakForBehandling={vedtakForBehandling}
                withBrevutkastknapp
            />
            <VilkårsOppsummering
                grunnlagsdataOgVilkårsvurderinger={behandling.grunnlagsdataOgVilkårsvurderinger}
                behandlingstatus={behandling.status}
                søknadInnhold={behandling.søknad.søknadInnhold}
                behandlingsinformasjon={behandling.behandlingsinformasjon}
            />
            {behandling.beregning && <VisBeregningOgSimulering sak={props.sak} behandling={behandling} />}
            <div className={styles.tilbakeLinkContainer}>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sak.id,
                    })}
                    className={classNames('knapp', styles.backButton)}
                >
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Link>
            </div>
        </div>
    );
};

export const BehandlingStatus = (props: {
    sakId: string;
    behandling: Behandling;
    vedtakForBehandling?: Vedtak;
    withBrevutkastknapp?: boolean;
}) => {
    const user = useUserContext();
    const intl = useI18n({ messages });

    const [lastNedBrevStatus, setLastNedBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );

    const hentBrev = useCallback(async () => {
        if (RemoteData.isPending(lastNedBrevStatus)) {
            return;
        }
        setLastNedBrevStatus(RemoteData.pending);

        const res = await PdfApi.fetchBrevutkastForSøknadsbehandling(props.sakId, props.behandling.id);
        if (res.status === 'ok') {
            window.open(URL.createObjectURL(res.data));
            setLastNedBrevStatus(RemoteData.success(null));
        } else {
            setLastNedBrevStatus(RemoteData.failure(res.error));
        }
    }, [props.sakId, props.behandling.id, lastNedBrevStatus._tag]);

    const Tilleggsinfo = () => {
        return (
            <div>
                <div className={styles.tilleggsinfoContainer}>
                    <div>
                        <Element>{intl.formatMessage({ id: 'vurdering.tittel' })}</Element>
                        <p>{statusTilTekst(props.behandling.status, intl)}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandlet.av' })}</Element>
                        <p>{props.behandling.saksbehandler || user.navn}</p>
                    </div>
                    {props.behandling.attestering?.attestant && (
                        <div>
                            <Element> {intl.formatMessage({ id: 'attestert.av' })}</Element>
                            <p>{props.behandling.attestering.attestant}</p>
                        </div>
                    )}

                    <div>
                        <Element> {intl.formatMessage({ id: 'behandling.søknadsdato' })}</Element>
                        <p>{søknadMottatt(props.behandling.søknad, intl)}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandling.saksbehandlingStartet' })}</Element>
                        <p>{intl.formatDate(props.behandling.opprettet)}</p>
                    </div>
                    {erIverksatt(props.behandling) && (
                        <div>
                            <Element> {intl.formatMessage({ id: 'behandling.iverksattDato' })}</Element>
                            <p>{intl.formatDate(props.vedtakForBehandling?.opprettet)}</p>
                        </div>
                    )}
                    {props.withBrevutkastknapp && (
                        <div>
                            <Element>{intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Element>
                            <Knapp
                                spinner={RemoteData.isPending(lastNedBrevStatus)}
                                mini
                                htmlType="button"
                                onClick={hentBrev}
                            >
                                {intl.formatMessage({ id: 'knapp.vis' })}
                            </Knapp>
                        </div>
                    )}
                </div>
                <div className={styles.brevutkastFeil}>
                    {RemoteData.isFailure(lastNedBrevStatus) && (
                        <AlertStripeFeil>
                            {lastNedBrevStatus.error.body?.message ??
                                intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </AlertStripeFeil>
                    )}
                </div>
            </div>
        );
    };

    if (props.behandling?.attestering?.underkjennelse) {
        return (
            <div className={styles.behandlingUnderkjentContainer}>
                <div className={styles.ikonContainer}>
                    <Ikon kind="advarsel-sirkel-fyll" className={styles.ikon} width={iconWidth} />
                    <p>{intl.formatMessage({ id: 'underkjent.sendtTilbakeFraAttestering' })}</p>
                </div>
                <div className={styles.grunnOgKommentarContainer}>
                    <div>
                        <Element>{intl.formatMessage({ id: 'underkjent.grunn' })}</Element>
                        <p>{underkjentGrunnTilTekst(props.behandling.attestering.underkjennelse?.grunn, intl)}</p>
                    </div>
                    <div>
                        <Element>{intl.formatMessage({ id: 'underkjent.kommentar' })}</Element>
                        <p>{props.behandling.attestering.underkjennelse?.kommentar}</p>
                    </div>
                </div>
                <Tilleggsinfo />
            </div>
        );
    }

    return <Tilleggsinfo />;
};

function statusTilTekst(behandlingsstatus: Behandlingsstatus, intl: IntlShape): string {
    switch (behandlingsstatus) {
        case Behandlingsstatus.VILKÅRSVURDERT_AVSLAG:
        case Behandlingsstatus.BEREGNET_AVSLAG:
        case Behandlingsstatus.TIL_ATTESTERING_AVSLAG:
        case Behandlingsstatus.IVERKSATT_AVSLAG:
        case Behandlingsstatus.UNDERKJENT_AVSLAG:
            return intl.formatMessage({ id: 'vurdering.avslag' });
        case Behandlingsstatus.TIL_ATTESTERING_INNVILGET:
        case Behandlingsstatus.SIMULERT:
        case Behandlingsstatus.VILKÅRSVURDERT_INNVILGET:
        case Behandlingsstatus.IVERKSATT_INNVILGET:
        case Behandlingsstatus.UNDERKJENT_INNVILGET:
            return intl.formatMessage({ id: 'vurdering.innvilgelse' });
        default:
            return '';
    }
}

function underkjentGrunnTilTekst(grunn: UnderkjennelseGrunn, intl: IntlShape): string {
    switch (grunn) {
        case UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT:
            return intl.formatMessage({ id: 'underkjent.grunn.InngangsvilkåreneErFeilvurdert' });
        case UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL:
            return intl.formatMessage({ id: 'underkjent.grunn.BeregningenErFeil' });
        case UnderkjennelseGrunn.DOKUMENTASJON_MANGLER:
            return intl.formatMessage({ id: 'underkjent.grunn.DokumentasjonenMangler' });
        case UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL:
            return intl.formatMessage({ id: 'underkjent.grunn.VedtaksbrevetErFeil' });
        case UnderkjennelseGrunn.ANDRE_FORHOLD:
            return intl.formatMessage({ id: 'underkjent.grunn.AndreForhold' });
        default:
            return '';
    }
}

export default Behandlingsoppsummering;

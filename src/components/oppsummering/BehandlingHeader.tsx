import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import * as PdfApi from '~api/pdfApi';
import { useUserContext } from '~context/userContext';
import { erIverksatt } from '~features/behandling/behandlingUtils';
import { useI18n, useBrevForhåndsvisning } from '~lib/hooks';
import { søknadMottatt } from '~lib/søknadUtils';
import { Behandling, Behandlingsstatus, UnderkjennelseGrunn } from '~types/Behandling';
import { Vedtak } from '~types/Vedtak';

import styles from './behandlingHeader.module.less';
import messages from './behandlingsoppsummering-nb';

const iconWidth = '24px';

const BehandlingHeader = (props: {
    sakId: string;
    behandling: Behandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}) => {
    const { intl } = useI18n({ messages });

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
                <Tilleggsinfo
                    sakId={props.sakId}
                    behandling={props.behandling}
                    vedtakForBehandling={props.vedtakForBehandling}
                    medBrevutkastknapp={props.medBrevutkastknapp}
                    intl={intl}
                />
            </div>
        );
    }

    return (
        <Tilleggsinfo
            sakId={props.sakId}
            behandling={props.behandling}
            vedtakForBehandling={props.vedtakForBehandling}
            medBrevutkastknapp={props.medBrevutkastknapp}
            intl={intl}
        />
    );
};

const Tilleggsinfo = (props: {
    sakId: string;
    behandling: Behandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
    intl: IntlShape;
}) => {
    const user = useUserContext();

    const [lastNedBrevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandling);
    const hentBrev = React.useCallback(async () => {
        lastNedBrev({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
        });
    }, [props.sakId, props.behandling.id, lastNedBrevStatus._tag]);

    return (
        <div>
            <div className={styles.tilleggsinfoContainer}>
                <div>
                    <Element>{props.intl.formatMessage({ id: 'vurdering.tittel' })}</Element>
                    <p>{statusTilTekst(props.behandling.status, props.intl)}</p>
                </div>
                <div>
                    <Element> {props.intl.formatMessage({ id: 'behandlet.av' })}</Element>
                    <p>{props.behandling.saksbehandler || user.navn}</p>
                </div>
                {props.behandling.attestering?.attestant && (
                    <div>
                        <Element> {props.intl.formatMessage({ id: 'attestert.av' })}</Element>
                        <p>{props.behandling.attestering.attestant}</p>
                    </div>
                )}

                <div>
                    <Element> {props.intl.formatMessage({ id: 'behandling.søknadsdato' })}</Element>
                    <p>{søknadMottatt(props.behandling.søknad, props.intl)}</p>
                </div>
                <div>
                    <Element> {props.intl.formatMessage({ id: 'behandling.saksbehandlingStartet' })}</Element>
                    <p>{props.intl.formatDate(props.behandling.opprettet)}</p>
                </div>
                {erIverksatt(props.behandling) && (
                    <div>
                        <Element> {props.intl.formatMessage({ id: 'behandling.iverksattDato' })}</Element>
                        <p>{props.intl.formatDate(props.vedtakForBehandling?.opprettet)}</p>
                    </div>
                )}
                {props.medBrevutkastknapp && (
                    <div>
                        <Element>{props.intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Element>
                        <Knapp
                            spinner={RemoteData.isPending(lastNedBrevStatus)}
                            mini
                            htmlType="button"
                            onClick={hentBrev}
                        >
                            {props.intl.formatMessage({ id: 'knapp.vis' })}
                        </Knapp>
                    </div>
                )}
            </div>
            <div className={styles.brevutkastFeil}>
                {RemoteData.isFailure(lastNedBrevStatus) && (
                    <AlertStripeFeil>
                        {lastNedBrevStatus.error?.body?.message ??
                            props.intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                    </AlertStripeFeil>
                )}
            </div>
        </div>
    );
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

export default BehandlingHeader;

import * as RemoteData from '@devexperts/remote-data-ts';
import Ikon from 'nav-frontend-ikoner-assets';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React, { useCallback } from 'react';
import { IntlShape } from 'react-intl';

import { useUserContext } from '~context/userContext';
import { lastNedBrev } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling, Behandlingsstatus, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';

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
    if (!behandling) {
        return <></>;
    }

    return (
        <>
            <BehandlingStatus sakId={props.sak.id} behandling={behandling} />
            <VilkårsOppsummering
                søknadInnhold={behandling.søknad.søknadInnhold}
                behandlingsinformasjon={behandling.behandlingsinformasjon}
            />
        </>
    );
};

export const BehandlingStatus = (props: { sakId: string; behandling: Behandling }) => {
    const { lastNedBrevStatus } = useAppSelector((s) => s.sak);
    const user = useUserContext();
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages });

    const hentBrev = useCallback(() => {
        if (RemoteData.isPending(lastNedBrevStatus)) {
            return;
        }

        dispatch(lastNedBrev({ sakId: props.sakId, behandlingId: props.behandling.id })).then((action) => {
            if (lastNedBrev.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [props.sakId, props.behandling.id]);

    const Tilleggsinfo = () => {
        return (
            <div className={styles.tilleggsinfoContainer}>
                <div>
                    <Element> Vurdering </Element>
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
                    <p>{intl.formatDate(props.behandling.søknad.opprettet)}</p>
                </div>
                <div>
                    <Element> {intl.formatMessage({ id: 'behandling.saksbehandlingsdato' })}</Element>
                    <p>{intl.formatDate(props.behandling.opprettet)}</p>
                </div>
                <div>
                    <Element>{intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Element>
                    <Knapp spinner={RemoteData.isPending(lastNedBrevStatus)} mini htmlType="button" onClick={hentBrev}>
                        {intl.formatMessage({ id: 'knapp.vis' })}
                    </Knapp>
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
            return intl.formatMessage({ id: 'vurdering.avslag' });
        case Behandlingsstatus.TIL_ATTESTERING_INNVILGET:
        case Behandlingsstatus.SIMULERT:
        case Behandlingsstatus.VILKÅRSVURDERT_INNVILGET:
        case Behandlingsstatus.IVERKSATT_INNVILGET:
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

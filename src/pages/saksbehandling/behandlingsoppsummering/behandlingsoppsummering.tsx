import * as RemoteData from '@devexperts/remote-data-ts';
import Ikon from 'nav-frontend-ikoner-assets';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React, { useCallback } from 'react';

import { useUserContext } from '~context/userContext';
import { erAvslått } from '~features/behandling/behandlingUtils';
import { lastNedBrev } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
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
                    <Element> {intl.formatMessage({ id: 'behandling.søknadsdato' })}</Element>
                    <p>{intl.formatDate(props.behandling.søknad.opprettet)}</p>
                </div>
                <div>
                    <Element> {intl.formatMessage({ id: 'behandling.saksbehandlingsdato' })}</Element>
                    <p>{intl.formatDate(props.behandling.opprettet)}</p>
                </div>
                <div>
                    <Element>{intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Element>
                    <Knapp spinner={RemoteData.isPending(lastNedBrevStatus)} htmlType="button" onClick={hentBrev}>
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
                        <p>{props.behandling.attestering?.underkjennelse?.grunn}</p>
                    </div>
                    <div>
                        <Element>{intl.formatMessage({ id: 'underkjent.kommentar' })}</Element>
                        <p>{props.behandling.attestering?.underkjennelse?.kommentar}</p>
                    </div>
                </div>
                <Tilleggsinfo />
            </div>
        );
    }

    return (
        <div className={styles.behandlingsinfoContainer}>
            <div className={styles.ikonContainer}>
                {[
                    Behandlingsstatus.TIL_ATTESTERING_INNVILGET,
                    Behandlingsstatus.SIMULERT,
                    Behandlingsstatus.IVERKSATT_INNVILGET,
                ].includes(props.behandling.status) && (
                    <Ikon kind="ok-sirkel-fyll" className={styles.ikon} width={iconWidth} />
                )}

                {erAvslått(props.behandling) && (
                    <Ikon kind="feil-sirkel-fyll" className={styles.ikon} width={iconWidth} />
                )}

                <p>
                    {intl.formatMessage({ id: 'behandlet.av' })} {user.navn}
                </p>
            </div>
            <Tilleggsinfo />
        </div>
    );
};

export default Behandlingsoppsummering;

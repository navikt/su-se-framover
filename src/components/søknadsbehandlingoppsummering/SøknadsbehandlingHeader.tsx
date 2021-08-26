import * as RemoteData from '@devexperts/remote-data-ts';
import { last } from 'fp-ts/lib/Array';
import { isSome } from 'fp-ts/lib/Option';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import * as PdfApi from '~api/pdfApi';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import { useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Vedtak } from '~types/Vedtak';
import { erIverksatt } from '~utils/behandling/behandlingUtils';
import { søknadMottatt } from '~utils/søknad/søknadUtils';

import messages from './søknadsbehandling-nb';
import styles from './søknadsbehandlingHeader.module.less';

const SøknadsbehandlingHeader = (props: {
    sakId: string;
    behandling: Behandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}) => {
    const { intl } = useI18n({ messages });
    const underkjenteAttesteringer = props.behandling.attesteringer.filter((att) => att.underkjennelse != null);

    if (underkjenteAttesteringer.length > 0) {
        return (
            <div className={styles.behandlingUnderkjentContainer}>
                <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
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
    const senesteAttestering = last(props.behandling.attesteringer);

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
                {isSome(senesteAttestering) && (
                    <div>
                        <Element> {props.intl.formatMessage({ id: 'attestert.av' })}</Element>
                        <p>{senesteAttestering.value.attestant}</p>
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

export default SøknadsbehandlingHeader;

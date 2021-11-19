import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Label, Loader } from '@navikt/ds-react';
import { last } from 'fp-ts/lib/Array';
import { isSome } from 'fp-ts/lib/Option';
import React from 'react';
import { IntlShape } from 'react-intl';

import * as DokumentApi from '~api/dokumentApi';
import * as PdfApi from '~api/pdfApi';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { DokumentIdType } from '~types/dokument/Dokument';
import { Vedtak } from '~types/Vedtak';
import { erIverksatt } from '~utils/behandling/behandlingUtils';
import { getBlob } from '~utils/dokumentUtils';
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

    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);
    const [hentBrevutkastStatus, hentBrevutkast] = useApiCall(PdfApi.fetchBrevutkastForSøknadsbehandling);

    const hentBrev = React.useCallback(async () => {
        const handleSuccess = (b: Blob) => window.open(URL.createObjectURL(b));

        // Hvis vi har et vedtak så ønsker vi å se det faktiske vedtaksbrevet.
        // Hvis ikke, så er det sannsynligvis fordi behandlingen ikke er iverksatt,
        // og at utkast da er det eneste vi har.
        if (props.vedtakForBehandling) {
            hentDokumenter(
                {
                    id: props.vedtakForBehandling.id,
                    idType: DokumentIdType.Vedtak,
                },
                (dokumenter) => handleSuccess(getBlob(dokumenter[0]))
            );
        } else {
            hentBrevutkast(
                {
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                },
                handleSuccess
            );
        }
    }, [props.behandling.id]);

    const hentBrevError = RemoteData.isFailure(hentBrevutkastStatus)
        ? hentBrevutkastStatus.error
        : RemoteData.isFailure(hentDokumenterStatus)
        ? hentDokumenterStatus.error
        : null;

    return (
        <div>
            <div className={styles.tilleggsinfoContainer}>
                <div>
                    <Label size="small" spacing>
                        {props.intl.formatMessage({ id: 'vurdering.tittel' })}
                    </Label>
                    <p>{statusTilTekst(props.behandling.status, props.intl)}</p>
                </div>
                <div>
                    <Label size="small" spacing>
                        {props.intl.formatMessage({ id: 'behandlet.av' })}
                    </Label>
                    <p>{props.behandling.saksbehandler || user.navn}</p>
                </div>
                {isSome(senesteAttestering) && (
                    <div>
                        <Label size="small" spacing>
                            {props.intl.formatMessage({ id: 'attestert.av' })}
                        </Label>
                        <p>{senesteAttestering.value.attestant}</p>
                    </div>
                )}

                <div>
                    <Label size="small" spacing>
                        {props.intl.formatMessage({ id: 'behandling.søknadsdato' })}
                    </Label>
                    <p>{søknadMottatt(props.behandling.søknad, props.intl)}</p>
                </div>
                <div>
                    <Label size="small" spacing>
                        {props.intl.formatMessage({ id: 'behandling.saksbehandlingStartet' })}
                    </Label>
                    <p>{props.intl.formatDate(props.behandling.opprettet)}</p>
                </div>
                {erIverksatt(props.behandling) && (
                    <div>
                        <Label size="small" spacing>
                            {props.intl.formatMessage({ id: 'behandling.iverksattDato' })}
                        </Label>
                        <p>{props.intl.formatDate(props.vedtakForBehandling?.opprettet)}</p>
                    </div>
                )}
                {props.medBrevutkastknapp && (
                    <div>
                        <Label size="small" spacing>
                            {erIverksatt(props.behandling)
                                ? props.intl.formatMessage({ id: 'brev.vedtaksbrev' })
                                : props.intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}
                        </Label>
                        <Button variant="secondary" size="small" type="button" onClick={hentBrev}>
                            {props.intl.formatMessage({ id: 'knapp.vis' })}
                            {(RemoteData.isPending(hentBrevutkastStatus) ||
                                RemoteData.isPending(hentDokumenterStatus)) && <Loader />}
                        </Button>
                        {hentBrevError && (
                            <Alert variant="error" size="small" className={styles.brevutkastFeil}>
                                {hentBrevError?.body?.message ??
                                    props.intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                            </Alert>
                        )}
                    </div>
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

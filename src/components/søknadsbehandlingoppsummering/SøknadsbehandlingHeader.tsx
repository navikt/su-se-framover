import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Label, Loader } from '@navikt/ds-react';
import { last } from 'fp-ts/lib/Array';
import { isSome } from 'fp-ts/lib/Option';
import React from 'react';

import * as DokumentApi from '~src/api/dokumentApi';
import * as PdfApi from '~src/api/pdfApi';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~src/context/userContext';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper } from '~src/typeMappinger/SøknadsbehandlingStatus';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vedtak } from '~src/types/Vedtak';
import { erIverksatt } from '~src/utils/behandling/SøknadsbehandlingUtils';
import { formatDate } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

import messages from './søknadsbehandling-nb';
import * as styles from './søknadsbehandlingHeader.module.less';

const SøknadsbehandlingHeader = (props: {
    sakId: string;
    behandling: Søknadsbehandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}) => {
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
        />
    );
};

const Tilleggsinfo = (props: {
    sakId: string;
    behandling: Søknadsbehandling;
    vedtakForBehandling?: Vedtak;
    medBrevutkastknapp?: boolean;
}) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper },
    });
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
                        {formatMessage('vurdering.tittel')}
                    </Label>
                    <p>{formatMessage(props.behandling.status)}</p>
                </div>
                <div>
                    <Label size="small" spacing>
                        {formatMessage('behandlet.av')}
                    </Label>
                    <p>{props.behandling.saksbehandler || user.navn}</p>
                </div>
                {isSome(senesteAttestering) && (
                    <div>
                        <Label size="small" spacing>
                            {formatMessage('attestert.av')}
                        </Label>
                        <p>{senesteAttestering.value.attestant}</p>
                    </div>
                )}

                <div>
                    <Label size="small" spacing>
                        {formatMessage('behandling.søknadsdato')}
                    </Label>
                    <p>{søknadMottatt(props.behandling.søknad)}</p>
                </div>
                <div>
                    <Label size="small" spacing>
                        {formatMessage('behandling.saksbehandlingStartet')}
                    </Label>
                    <p>{formatDate(props.behandling.opprettet)}</p>
                </div>
                {props.vedtakForBehandling && (
                    <div>
                        <Label size="small" spacing>
                            {formatMessage('behandling.iverksattDato')}
                        </Label>
                        <p>{formatDate(props.vedtakForBehandling!.opprettet)}</p>
                    </div>
                )}
                {props.medBrevutkastknapp && (
                    <div>
                        <Label size="small" spacing>
                            {erIverksatt(props.behandling)
                                ? formatMessage('brev.vedtaksbrev')
                                : formatMessage('brev.utkastVedtaksbrev')}
                        </Label>
                        <Button variant="secondary" size="small" type="button" onClick={hentBrev}>
                            {formatMessage('knapp.vis')}
                            {(RemoteData.isPending(hentBrevutkastStatus) ||
                                RemoteData.isPending(hentDokumenterStatus)) && <Loader />}
                        </Button>
                        {hentBrevError && (
                            <Alert variant="error" size="small" className={styles.brevutkastFeil}>
                                {hentBrevError?.body?.message ?? formatMessage('feilmelding.ukjentFeil')}
                            </Alert>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SøknadsbehandlingHeader;

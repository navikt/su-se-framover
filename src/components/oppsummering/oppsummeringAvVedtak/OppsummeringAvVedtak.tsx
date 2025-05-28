import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Label, Loader } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import * as DokumentApi from '~src/api/dokumentApi';
import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { FormkravInfo } from '~src/components/oppsummering/oppsummeringAvKlage/OppsummeringAvKlage';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Behandling } from '~src/types/Behandling';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage } from '~src/types/Klage';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Regulering } from '~src/types/Regulering';
import { InformasjonsRevurdering, Revurdering, TilbakekrevingsAvgjørelse } from '~src/types/Revurdering';
import { Sak, Sakstype } from '~src/types/Sak.ts';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vedtak } from '~src/types/Vedtak';
import { erBehandlingRevurdering, erBehandlingSøknadsbehandling } from '~src/utils/behandling/BehandlingUtils';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { splitStatusOgResultatFraKlage } from '~src/utils/klage/klageUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import {
    erInformasjonsRevurdering,
    erRevurderingIverksattMedTilbakekreving,
    splitStatusOgResultatFraRevurdering,
} from '~src/utils/revurdering/revurderingUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';
import { splitStatusOgResultatFraSøkandsbehandling } from '~src/utils/SøknadsbehandlingUtils';
import {
    erDokumentGenerertEllerSenere,
    erDokumentIkkeGenerertEnda,
    getVedtaketsbehandling,
    getVedtakstype,
    skalDokumentIkkeGenereres,
} from '~src/utils/VedtakUtils';

import OppsummeringAvBeregningOgSimulering from '../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import OppsummeringAvTilbakekrevingsbehandling, {
    OppsummeringAvTilbakekrevingsbehandlingbrev,
} from '../oppsummeringAvTilbakekrevingsbehandling/OppsummeringAvTilbakekrevingsbehandling';

import messages from './OppsummeringAvVedtak-nb';
import styles from './OppsummeringAvVedtak.module.less';

const typeBehandling = (b: Behandling | Klage | Regulering | ManuellTilbakekrevingsbehandling) => {
    if ('klagevedtakshistorikk' in b) {
        return 'klage';
    }
    if ('reguleringstype' in b) {
        return 'regulering';
    }
    if ('kravgrunnlag' in b) {
        return 'tilbakekrevingsbehandling';
    }
    if (erBehandlingSøknadsbehandling(b)) {
        return 'søknadsbehandling';
    }
    if (erBehandlingRevurdering(b)) {
        return 'revurdering';
    }
    throw new Error(`Ukjent behandlingstype ${b}`);
};

const OppsummeringAvVedtak = (props: { vedtakId?: string; vedtak?: Vedtak }) => {
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);
    //brevet for vedtak på tilbakekreving ligger ikke som et dokument i basen på samme måte som andre vedtak.
    //og kan derfor ikke hentes gjennom hentDokumenter
    const [tilbakekrevingsbrevStatus, hentTilbakekrevingsbrev] = useApiCall(
        forhåndsvisVedtaksbrevTilbakekrevingsbehandling,
    );

    if (!props.vedtakId && !props.vedtak) {
        throw new Error('Feil bruk av komponenten. Send med vedtak-id eller et vedtak');
    }

    const vedtak = props.vedtak ?? sak.vedtak.find((v) => v.id === props.vedtakId)!;

    const vedtaketsBehandling = getVedtaketsbehandling(vedtak, sak);
    const behandlingstype = typeBehandling(vedtaketsBehandling);

    return (
        <div className={styles.vedtaksContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('oppsummeringspanel.vedtak.info')}
            >
                <div className={styles.vedtakOgBehandlingInfoContainer}>
                    <OppsummeringPar
                        label={formatMessage('vedtak.vedtakstype')}
                        verdi={getVedtakstype(vedtak)}
                        retning={'vertikal'}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.saksbehandler')}
                        verdi={vedtak.saksbehandler}
                        retning={'vertikal'}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.attestant')}
                        verdi={vedtak.attestant}
                        retning={'vertikal'}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.iverksatt')}
                        verdi={formatDateTime(vedtak.opprettet)}
                        retning={'vertikal'}
                    />
                    {vedtak.periode && (
                        <OppsummeringPar
                            label={formatMessage('vedtak.periode')}
                            verdi={formatPeriode(vedtak.periode)}
                            retning={'vertikal'}
                        />
                    )}
                </div>
                {skalDokumentIkkeGenereres(vedtak) && <Label>{formatMessage('vedtak.brev.ingenBrevSendt')}</Label>}
                {erDokumentIkkeGenerertEnda(vedtak) && <Label>{formatMessage('vedtak.brev.ikkeGenerertEnda')}</Label>}
                {erDokumentGenerertEllerSenere(vedtak) && (
                    <div className={styles.knappOgApiErrorContainer}>
                        <Button
                            className={styles.knapp}
                            variant="secondary"
                            loading={
                                RemoteData.isPending(hentDokumenterStatus) ||
                                RemoteData.isPending(tilbakekrevingsbrevStatus)
                            }
                            onClick={() =>
                                behandlingstype === 'tilbakekrevingsbehandling'
                                    ? hentTilbakekrevingsbrev(
                                          {
                                              sakId: (vedtaketsBehandling as ManuellTilbakekrevingsbehandling).sakId,
                                              behandlingId: vedtaketsBehandling.id,
                                          },
                                          (res) => {
                                              window.open(URL.createObjectURL(res));
                                          },
                                      )
                                    : hentDokumenter({ id: vedtak.id, idType: DokumentIdType.Vedtak }, (dokumenter) =>
                                          window.open(URL.createObjectURL(getBlob(dokumenter[0]))),
                                      )
                            }
                        >
                            {formatMessage('knapp.seBrev')}
                        </Button>
                        {RemoteData.isFailure(hentDokumenterStatus) && (
                            <ApiErrorAlert error={hentDokumenterStatus.error} />
                        )}
                        {RemoteData.isFailure(tilbakekrevingsbrevStatus) && (
                            <ApiErrorAlert error={tilbakekrevingsbrevStatus.error} />
                        )}
                    </div>
                )}
                {behandlingstype === 'revurdering' &&
                    (vedtaketsBehandling as Revurdering) &&
                    erInformasjonsRevurdering(vedtaketsBehandling as Revurdering) && (
                        <OppsummeringPar
                            className={styles.brevvalgBegrunnelse}
                            label={formatMessage('revurdering.brevvalg.begrunnelse')}
                            verdi={(vedtaketsBehandling as InformasjonsRevurdering).brevvalg.begrunnelse}
                            retning={'vertikal'}
                        />
                    )}
            </Oppsummeringspanel>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Task}
                farge={Oppsummeringsfarge.Blå}
                tittel={formatMessage('oppsummeringspanel.vedtak.behandling.info')}
            >
                {behandlingstype === 'søknadsbehandling' && (
                    <PartialOppsummeringAvSøknadsbehandling
                        s={vedtaketsBehandling as Søknadsbehandling}
                        sakstype={sak.sakstype}
                    />
                )}
                {behandlingstype === 'revurdering' && (
                    <PartialOppsummeringAvRevurdering r={vedtaketsBehandling as Revurdering} sak={sak} v={vedtak} />
                )}
                {behandlingstype === 'regulering' && (
                    <PartialOppsummeringAvRegulering r={vedtaketsBehandling as Regulering} />
                )}
                {behandlingstype === 'klage' && (
                    <PartialOppsummeringAvKlage v={vedtak} k={vedtaketsBehandling as Klage} />
                )}
                {behandlingstype === 'tilbakekrevingsbehandling' && (
                    <OppsummeringAvTilbakekrevingsbehandling
                        behandling={vedtaketsBehandling as ManuellTilbakekrevingsbehandling}
                        utenPanel
                    />
                )}
            </Oppsummeringspanel>
            {behandlingstype === 'tilbakekrevingsbehandling' && (
                <OppsummeringAvTilbakekrevingsbehandlingbrev
                    behandling={vedtaketsBehandling as ManuellTilbakekrevingsbehandling}
                    utenVedtaksbrev
                />
            )}
            {behandlingstype !== 'tilbakekrevingsbehandling' && (
                <OppsummeringAvBeregningOgSimulering
                    eksterngrunnlagSkatt={
                        behandlingstype === 'søknadsbehandling'
                            ? (vedtaketsBehandling as Søknadsbehandling).eksterneGrunnlag.skatt
                            : null
                    }
                    tittel={formatMessage('oppsummeringspanel.vedtak.beregningOgSimulering')}
                    beregning={vedtak.beregning}
                    simulering={vedtak.simulering}
                />
            )}
        </div>
    );
};

const PartialOppsummeringAvSøknadsbehandling = (props: { s: Søknadsbehandling; sakstype: Sakstype }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraSøkandsbehandling(props.s).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.startet')}
                    verdi={formatDateTime(props.s.opprettet)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.søknadsdato')}
                    verdi={søknadMottatt(props.s.søknad)}
                    retning={'vertikal'}
                />
            </div>
            <SidestiltOppsummeringAvVilkårOgGrunnlag
                grunnlagsdataOgVilkårsvurderinger={props.s.grunnlagsdataOgVilkårsvurderinger}
                visesSidestiltMed={props.s.søknad.søknadInnhold}
                sakstype={props.sakstype}
            />
        </div>
    );
};

const PartialOppsummeringAvRevurdering = (props: { sak: Sak; v: Vedtak; r: Revurdering }) => {
    const { formatMessage } = useI18n({ messages });
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);

    useEffect(() => {
        if (erInformasjonsRevurdering(props.r)) {
            hentRevurderingSnapshot({ sakId: props.sak.id, vedtakId: props.v.id });
        }
    }, []);

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraRevurdering(props.r).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.startet')}
                    verdi={formatDateTime(props.r.opprettet)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.årsakForRevurdering')}
                    verdi={formatMessage(props.r.årsak)}
                    retning={'vertikal'}
                />
                {erRevurderingIverksattMedTilbakekreving(props.r) && (
                    <OppsummeringPar
                        label={formatMessage('revurdering.skalTilbakekreves')}
                        verdi={formatMessage(
                            `bool.${props.r.tilbakekrevingsbehandling.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV}`,
                        )}
                        retning={'vertikal'}
                    />
                )}
            </div>
            <OppsummeringPar
                label={formatMessage('revurdering.begrunnelse')}
                verdi={props.r.begrunnelse}
                retning={'vertikal'}
            />
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <></>,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (snapshotRevurderingGrunnlagsdataOgVilkår) => (
                        <SidestiltOppsummeringAvVilkårOgGrunnlag
                            grunnlagsdataOgVilkårsvurderinger={props.r.grunnlagsdataOgVilkårsvurderinger}
                            visesSidestiltMed={snapshotRevurderingGrunnlagsdataOgVilkår}
                            sakstype={props.sak.sakstype}
                        />
                    ),
                ),
            )}
        </div>
    );
};

const PartialOppsummeringAvRegulering = (props: { r: Regulering }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.vedtakOgBehandlingInfoContainer}>
            <OppsummeringPar
                label={formatMessage('regulering.utført')}
                verdi={formatMessage(props.r.reguleringstype)}
                retning={'vertikal'}
            />
        </div>
    );
};

const PartialOppsummeringAvKlage = (props: { v: Vedtak; k: Klage }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('klage.behandlingStartet')}
                    verdi={formatDateTime(props.k.opprettet)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraKlage(props.k).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('klage.journalpostId')}
                    verdi={props.k.journalpostId}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('klage.datoKlageMottatt')}
                    verdi={formatDate(props.k.datoKlageMottatt)}
                    retning={'vertikal'}
                />
            </div>
            <FormkravInfo klage={props.k} klagensVedtak={props.v} />
        </div>
    );
};

export default OppsummeringAvVedtak;

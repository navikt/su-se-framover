import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import * as DokumentApi from '~src/api/dokumentApi';
import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { FormkravInfo } from '~src/components/oppsummeringAvKlage/OppsummeringAvKlage';
import { OppsummeringPar, OppsummeringsParSortering } from '~src/components/oppsummeringspar/Oppsummeringsverdi';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '~src/components/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Behandling } from '~src/types/Behandling';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage } from '~src/types/Klage';
import { Regulering } from '~src/types/Regulering';
import { Revurdering } from '~src/types/Revurdering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vedtak } from '~src/types/Vedtak';
import { erBehandlingRevurdering, erBehandlingSøknadsbehandling } from '~src/utils/behandling/BehandlingUtils';
import { splitStatusOgResultatFraSøkandsbehandling } from '~src/utils/behandling/SøknadsbehandlingUtils';
import { formatDate, formatDateTime, formatPeriode } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { splitStatusOgResultatFraKlage } from '~src/utils/klage/klageUtils';
import {
    erInformasjonsRevurdering,
    hentAvkortingFraRevurdering,
    splitStatusOgResultatFraRevurdering,
} from '~src/utils/revurdering/revurderingUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';
import { getVedtaketsbehandling, getVedtakstype, harVedtaketBrevSomSendesUt } from '~src/utils/VedtakUtils';

import BeregningOgSimulering from '../beregningOgSimulering/BeregningOgSimulering';

import messages from './OppsummeringAvVedtak-nb';
import * as styles from './OppsummeringAvVedtak.module.less';

const typeBehandling = (b: Behandling | Klage | Regulering) => {
    if ('klagevedtakshistorikk' in b) {
        return 'klage';
    }
    if ('reguleringstype' in b) {
        return 'regulering';
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
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.saksbehandler')}
                        verdi={vedtak.saksbehandler}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.attestant')}
                        verdi={vedtak.attestant}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                    <OppsummeringPar
                        label={formatMessage('vedtak.iverksatt')}
                        verdi={formatDateTime(vedtak.opprettet)}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                    {vedtak.periode && (
                        <OppsummeringPar
                            label={formatMessage('vedtak.periode')}
                            verdi={formatPeriode(vedtak.periode)}
                            sorteres={OppsummeringsParSortering.Vertikalt}
                        />
                    )}
                </div>
                {harVedtaketBrevSomSendesUt(vedtak) && (
                    <div className={styles.knappOgApiErrorContainer}>
                        <Button
                            className={styles.knapp}
                            variant="secondary"
                            loading={RemoteData.isPending(hentDokumenterStatus)}
                            onClick={() =>
                                hentDokumenter({ id: vedtak.id, idType: DokumentIdType.Vedtak }, (dokumenter) =>
                                    window.open(URL.createObjectURL(getBlob(dokumenter[0])))
                                )
                            }
                        >
                            {formatMessage('knapp.seBrev')}
                        </Button>
                        {RemoteData.isFailure(hentDokumenterStatus) && (
                            <ApiErrorAlert error={hentDokumenterStatus.error} />
                        )}
                    </div>
                )}
            </Oppsummeringspanel>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Task}
                farge={Oppsummeringsfarge.Blå}
                tittel={formatMessage('oppsummeringspanel.vedtak.behandling.info')}
            >
                {behandlingstype === 'søknadsbehandling' && (
                    <PartialOppsummeringAvSøknadsbehandling s={vedtaketsBehandling as Søknadsbehandling} />
                )}
                {behandlingstype === 'revurdering' && (
                    <PartialOppsummeringAvRevurdering
                        r={vedtaketsBehandling as Revurdering}
                        sakId={sak.id}
                        v={vedtak}
                    />
                )}
                {behandlingstype === 'regulering' && (
                    <PartialOppsummeringAvRegulering r={vedtaketsBehandling as Regulering} />
                )}
                {behandlingstype === 'klage' && (
                    <PartialOppsummeringAvKlage v={vedtak} k={vedtaketsBehandling as Klage} />
                )}
            </Oppsummeringspanel>

            <BeregningOgSimulering
                tittel={formatMessage('oppsummeringspanel.vedtak.beregningOgSimulering')}
                beregning={vedtak.beregning}
                simulering={vedtak.simulering}
            />
        </div>
    );
};

const PartialOppsummeringAvSøknadsbehandling = (props: { s: Søknadsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraSøkandsbehandling(props.s).resultat}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.startet')}
                    verdi={formatDateTime(props.s.opprettet)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.søknadsdato')}
                    verdi={søknadMottatt(props.s.søknad)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>
            <SidestiltOppsummeringAvVilkårOgGrunnlag
                grunnlagsdataOgVilkårsvurderinger={props.s.grunnlagsdataOgVilkårsvurderinger}
                visesSidestiltMed={props.s.søknad.søknadInnhold}
            />
        </div>
    );
};

const PartialOppsummeringAvRevurdering = (props: { sakId: string; v: Vedtak; r: Revurdering }) => {
    const { formatMessage } = useI18n({ messages });
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);
    const avkortingsInfo = hentAvkortingFraRevurdering(props.r);

    useEffect(() => {
        if (erInformasjonsRevurdering(props.r)) {
            hentRevurderingSnapshot({ sakId: props.sakId, vedtakId: props.v.id });
        }
    }, []);

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraRevurdering(props.r).resultat}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.startet')}
                    verdi={formatDateTime(props.r.opprettet)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.årsakForRevurdering')}
                    verdi={formatMessage(props.r.årsak)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('revurdering.begrunnelse')}
                    verdi={props.r.begrunnelse}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <></>,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (snapshot) => (
                        <SidestiltOppsummeringAvVilkårOgGrunnlag
                            grunnlagsdataOgVilkårsvurderinger={props.r.grunnlagsdataOgVilkårsvurderinger}
                            visesSidestiltMed={snapshot}
                        />
                    )
                )
            )}

            {avkortingsInfo && (
                <div className={styles.avkorting}>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('simulering.avkorting')}
                    </Heading>
                    <div className={styles.avkortingContent}>
                        <OppsummeringPar
                            label={formatMessage('simulering.avkorting.total')}
                            verdi={formatCurrency(avkortingsInfo.totalOppsummering.sumFeilutbetaling)}
                        />
                        <ul className={styles.avkortingListe}>
                            {avkortingsInfo.periodeOppsummering.map((periode) => (
                                <li key={periode.fraOgMed}>
                                    <BodyShort>
                                        {formatPeriode({ fraOgMed: periode.fraOgMed, tilOgMed: periode.tilOgMed })}
                                    </BodyShort>
                                    <BodyShort>
                                        {`${formatCurrency(periode.sumFeilutbetaling)} ${formatMessage(
                                            'simulering.avkorting.ytelse.imåned'
                                        )}`}
                                    </BodyShort>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
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
                sorteres={OppsummeringsParSortering.Vertikalt}
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
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraKlage(props.k).resultat}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('klage.journalpostId')}
                    verdi={props.k.journalpostId}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('klage.datoKlageMottatt')}
                    verdi={formatDate(props.k.datoKlageMottatt)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>

            <FormkravInfo klage={props.k} klagensVedtak={props.v} />
        </div>
    );
};

export default OppsummeringAvVedtak;

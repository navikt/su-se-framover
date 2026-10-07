import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Heading, Loader, VStack } from '@navikt/ds-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hentHistoriskInfotrygdRevurdering } from '~src/api/historiskAlderssakApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import AvsluttHistoriskInfotrygdRevurdering from '~src/features/historiskAlderssak/AvsluttHistoriskInfotrygdRevurdering';
import HistoriskAlderssakApiErrorAlert from '~src/features/historiskAlderssak/HistoriskAlderssakApiErrorAlert';
import historiskStyles from '~src/features/historiskAlderssak/HistoriskAlderssakVisning.module.less';
import HistoriskInfotrygdBeregning from '~src/features/historiskAlderssak/HistoriskInfotrygdBeregning';
import HistoriskInfotrygdEtterBeregning from '~src/features/historiskAlderssak/HistoriskInfotrygdEtterBeregning';
import HistoriskInfotrygdRevurderingsdetaljer from '~src/features/historiskAlderssak/HistoriskInfotrygdRevurderingsdetaljer';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { VisDokumenter } from '~src/pages/saksbehandling/dokumenter/DokumenterPage';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { HistoriskInfotrygdRevurdering as HistoriskInfotrygdRevurderingType } from '~src/types/HistoriskInfotrygdRevurdering';

const HistoriskInfotrygdRevurdering = () => {
    const { revurderingId, sakId } = Routes.useRouteParams<typeof Routes.historiskInfotrygdRevurdering>();
    const location = useLocation();
    const navigate = useNavigate();
    const [opprettetRevurdering, setOpprettetRevurdering] = useState<HistoriskInfotrygdRevurderingType | null>(() => {
        const state = location.state as { opprettetRevurdering?: HistoriskInfotrygdRevurderingType } | null;
        const behandling = state?.opprettetRevurdering;
        return behandling && behandling.id === revurderingId && behandling.sakId === sakId ? behandling : null;
    });
    const hoppOverFørsteHenting = useRef(opprettetRevurdering !== null);
    const [revurdering, hentRevurdering] = useApiCall(hentHistoriskInfotrygdRevurdering);
    const [oppfriskStatus, oppfriskRevurdering] = useApiCall(hentHistoriskInfotrygdRevurdering);
    const [beregnetBehandling, setBeregnetBehandling] = useState<HistoriskInfotrygdRevurderingType | null>(null);

    useEffect(() => {
        if (opprettetRevurdering) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, []);

    useEffect(() => {
        if (hoppOverFørsteHenting.current) {
            hoppOverFørsteHenting.current = false;
            return;
        }
        setBeregnetBehandling(null);
        setOpprettetRevurdering(null);
        if (revurderingId) {
            hentRevurdering(revurderingId);
        }
    }, [hentRevurdering, revurderingId]);

    // Oppdaterer i bakgrunnen slik at innholdet ikke erstattes av en laster og monteres på nytt.
    const lastRevurderingPåNytt = (id: string) => {
        oppfriskRevurdering(id, setBeregnetBehandling);
    };

    return (
        <section className={historiskStyles.side} aria-labelledby="historisk-revurdering-tittel">
            <VStack gap="6">
                <div>
                    <Heading id="historisk-revurdering-tittel" level="1" size="large" spacing>
                        Historisk revurdering
                    </Heading>
                    <BodyShort>Revurdering av ytelse som tidligere ble behandlet i Infotrygd.</BodyShort>
                </div>

                {pipe(
                    opprettetRevurdering !== null && opprettetRevurdering.id === revurderingId
                        ? RemoteData.success(opprettetRevurdering)
                        : revurdering,
                    RemoteData.fold(
                        () => null,
                        () => <Loader title="Henter historisk revurdering" size="large" />,
                        (error) => <HistoriskAlderssakApiErrorAlert error={error} />,
                        (resultat) => {
                            const gjeldendeRevurdering = beregnetBehandling ?? resultat;

                            return (
                                <VStack gap="6">
                                    <HistoriskInfotrygdRevurderingsdetaljer revurdering={gjeldendeRevurdering} />
                                    {RemoteData.isFailure(oppfriskStatus) && (
                                        <HistoriskAlderssakApiErrorAlert error={oppfriskStatus.error} />
                                    )}
                                    {gjeldendeRevurdering.status !== 'AVSLUTTET' &&
                                        gjeldendeRevurdering.status !== 'ATTESTERT' && (
                                            <HistoriskInfotrygdBeregning
                                                behandling={gjeldendeRevurdering}
                                                onOppdatert={setBeregnetBehandling}
                                            />
                                        )}
                                    <HistoriskInfotrygdEtterBeregning
                                        behandling={gjeldendeRevurdering}
                                        onOppdatert={() => lastRevurderingPåNytt(gjeldendeRevurdering.id)}
                                    />
                                    {gjeldendeRevurdering.status !== 'AVSLUTTET' &&
                                        gjeldendeRevurdering.status !== 'TIL_ATTESTERING' && (
                                            <AvsluttHistoriskInfotrygdRevurdering
                                                revurderingId={gjeldendeRevurdering.id}
                                                onAvsluttet={() => lastRevurderingPåNytt(gjeldendeRevurdering.id)}
                                            />
                                        )}
                                    <section aria-labelledby="historisk-revurdering-dokumenter">
                                        <Heading id="historisk-revurdering-dokumenter" level="2" size="medium">
                                            Dokumenter for behandlingen
                                        </Heading>
                                        <VisDokumenter
                                            id={gjeldendeRevurdering.id}
                                            idType={DokumentIdType.HistoriskInfotrygdRevurdering}
                                        />
                                    </section>
                                </VStack>
                            );
                        },
                    ),
                )}

                {sakId && (
                    <div>
                        <LinkAsButton variant="secondary" href={Routes.historiskAlderssak.createURL({ sakId })}>
                            Tilbake til Infotrygd-saken
                        </LinkAsButton>
                    </div>
                )}
            </VStack>
        </section>
    );
};

export default HistoriskInfotrygdRevurdering;

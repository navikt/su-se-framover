import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Box, Button, Heading, Label, Loader, Textarea, VStack } from '@navikt/ds-react';
import { FormEvent, useEffect, useState } from 'react';

import {
    avsluttHistoriskInfotrygdRevurdering,
    hentHistoriskInfotrygdRevurdering,
} from '~src/api/historiskAlderssakApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import HistoriskAlderssakApiErrorAlert from '~src/features/historiskAlderssak/HistoriskAlderssakApiErrorAlert';
import historiskStyles from '~src/features/historiskAlderssak/HistoriskAlderssakVisning.module.less';
import HistoriskInfotrygdBeregning from '~src/features/historiskAlderssak/HistoriskInfotrygdBeregning';
import HistoriskInfotrygdEtterBeregning from '~src/features/historiskAlderssak/HistoriskInfotrygdEtterBeregning';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { HistoriskInfotrygdRevurdering as HistoriskInfotrygdRevurderingType } from '~src/types/HistoriskInfotrygdRevurdering';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';

const statusTekst: Record<HistoriskInfotrygdRevurderingType['status'], string> = {
    OPPRETTET: 'Opprettet',
    BEREGNET: 'Beregnet',
    TIL_ATTESTERING: 'Til attestering',
    ATTESTERT: 'Attestert',
    UNDERKJENT: 'Underkjent',
    AVSLUTTET: 'Avsluttet',
};

const Revurderingsdetaljer = (props: { revurdering: HistoriskInfotrygdRevurderingType }) => (
    <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
        <dl className={historiskStyles.detaljer}>
            <div>
                <Label as="dt" size="small">
                    Behandlings-ID
                </Label>
                <BodyShort as="dd">{props.revurdering.id}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Periode
                </Label>
                <BodyShort as="dd">
                    {formatDate(props.revurdering.periode.fraOgMed)}–{formatDate(props.revurdering.periode.tilOgMed)}
                </BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Status
                </Label>
                <BodyShort as="dd">{statusTekst[props.revurdering.status]}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Opprettet
                </Label>
                <BodyShort as="dd">{formatDateTime(props.revurdering.opprettet)}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Sist oppdatert
                </Label>
                <BodyShort as="dd">{formatDateTime(props.revurdering.oppdatert)}</BodyShort>
            </div>
        </dl>
    </Box>
);

const AvsluttRevurdering = (props: { revurderingId: string; onAvsluttet: () => void }) => {
    const [begrunnelse, setBegrunnelse] = useState('');
    const [begrunnelseFeil, setBegrunnelseFeil] = useState<string>();
    const [avsluttStatus, avslutt] = useApiCall(avsluttHistoriskInfotrygdRevurdering);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmetBegrunnelse = begrunnelse.trim();

        if (!trimmetBegrunnelse) {
            setBegrunnelseFeil('Skriv hvorfor behandlingen skal avsluttes.');
            return;
        }

        setBegrunnelseFeil(undefined);
        avslutt(
            {
                revurderingId: props.revurderingId,
                body: { begrunnelse: trimmetBegrunnelse },
            },
            props.onAvsluttet,
        );
    };

    return (
        <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="5">
            <form onSubmit={handleSubmit}>
                <VStack gap="4" align="start">
                    <Heading level="2" size="medium">
                        Avslutt behandlingen
                    </Heading>
                    <Textarea
                        label="Begrunnelse"
                        description="Forklar hvorfor behandlingen skal avsluttes."
                        value={begrunnelse}
                        onChange={(event) => setBegrunnelse(event.target.value)}
                        error={begrunnelseFeil}
                    />
                    {RemoteData.isFailure(avsluttStatus) && (
                        <HistoriskAlderssakApiErrorAlert error={avsluttStatus.error} />
                    )}
                    <Button type="submit" variant="danger" loading={RemoteData.isPending(avsluttStatus)}>
                        Avslutt behandlingen
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

const HistoriskInfotrygdRevurdering = () => {
    const { revurderingId, sakId } = Routes.useRouteParams<typeof Routes.historiskInfotrygdRevurdering>();
    const [revurdering, hentRevurdering] = useApiCall(hentHistoriskInfotrygdRevurdering);

    useEffect(() => {
        if (revurderingId) {
            hentRevurdering(revurderingId);
        }
    }, [hentRevurdering, revurderingId]);

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
                    revurdering,
                    RemoteData.fold(
                        () => null,
                        () => <Loader title="Henter historisk revurdering" size="large" />,
                        (error) => <HistoriskAlderssakApiErrorAlert error={error} />,
                        (resultat) => (
                            <VStack gap="6">
                                <Revurderingsdetaljer revurdering={resultat} />
                                {resultat.status !== 'AVSLUTTET' && resultat.status !== 'ATTESTERT' && (
                                    <HistoriskInfotrygdBeregning
                                        behandling={resultat}
                                        onOppdatert={() => hentRevurdering(resultat.id)}
                                    />
                                )}
                                <HistoriskInfotrygdEtterBeregning
                                    behandling={resultat}
                                    onOppdatert={() => hentRevurdering(resultat.id)}
                                />
                                {resultat.status !== 'AVSLUTTET' && resultat.status !== 'TIL_ATTESTERING' && (
                                    <AvsluttRevurdering
                                        revurderingId={resultat.id}
                                        onAvsluttet={() => hentRevurdering(resultat.id)}
                                    />
                                )}
                            </VStack>
                        ),
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

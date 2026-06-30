import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, BodyShort, Box, Button, FileUpload, Heading, Textarea } from '@navikt/ds-react';
import { AccordionContent, AccordionHeader, AccordionItem } from '@navikt/ds-react/Accordion';
import { useEffect, useState } from 'react';

import * as notatApi from '~src/api/notatApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { useApiCall } from '~src/lib/hooks';
import { OpprettNotatBody, ReferanseType } from '~src/types/Notat';
import styles from './notatPanel.module.less';

type Props = {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
    underAttestering: boolean;
};

const NotatPanel = (props: Props) => {
    const [notatStatus, hentNotat, resetNotat] = useApiCall(notatApi.hentNotat);
    const [opprettStatus, opprettNotat] = useApiCall((request: { sakId: string; body: OpprettNotatBody }) =>
        notatApi.opprettNotat(request.sakId, request.body),
    );
    const [lagreSaksbehandlerStatus, lagreSaksbehandlerNotat] = useApiCall(notatApi.oppdaterNotatSomSaksbehandler);
    const [lagreAttestantStatus, lagreAttestantNotat] = useApiCall(notatApi.oppdaterNotatSomAttestant);
    const [vedleggStatus, leggTilVedlegg] = useApiCall(notatApi.leggTilVedlegg);
    const [slettVedleggStatus, slettVedlegg] = useApiCall(notatApi.slettVedlegg);
    const [notatTekst, setNotatTekst] = useState('');
    const [valgtFil, setValgtFil] = useState<File | null>(null);

    useEffect(() => {
        resetNotat();
        setValgtFil(null);
        setNotatTekst('');
        hentNotat({
            sakId: props.sakId,
            referanseId: props.referanseId,
            referanseType: props.referanseType,
        });
    }, [props.sakId, props.referanseId, props.referanseType, resetNotat]);

    const notatMedVedlegg = RemoteData.isSuccess(notatStatus) ? notatStatus.value : null;
    const notat = notatMedVedlegg?.notat ?? null;
    const manglerNotat = RemoteData.isSuccess(notatStatus) && notatStatus.value === null;

    useEffect(() => {
        setNotatTekst(notat?.notat ?? '');
    }, [notat?.id, notat?.endret]);

    const refreshNotat = () => {
        hentNotat({
            sakId: props.sakId,
            referanseId: props.referanseId,
            referanseType: props.referanseType,
        });
    };

    const handleOpprettNotat = () => {
        opprettNotat(
            {
                sakId: props.sakId,
                body: {
                    referanseId: props.referanseId,
                    referanseType: props.referanseType,
                },
            },
            () => refreshNotat(),
        );
    };

    const handleLagreNotat = () => {
        if (!notat) {
            return;
        }

        const lagre = props.underAttestering ? lagreAttestantNotat : lagreSaksbehandlerNotat;
        lagre(
            {
                sakId: props.sakId,
                notatId: notat.id,
                notat: notatTekst,
            },
            () => refreshNotat(),
        );
    };

    const handleLastOppVedlegg = () => {
        if (!notat || !valgtFil) {
            return;
        }

        leggTilVedlegg(
            {
                sakId: props.sakId,
                notatId: notat.id,
                filnavn: valgtFil.name,
                fil: valgtFil,
            },
            () => {
                setValgtFil(null);
                refreshNotat();
            },
        );
    };

    const handleSlettVedlegg = (vedleggId: string) => {
        if (!notat) {
            return;
        }

        slettVedlegg(
            {
                sakId: props.sakId,
                notatId: notat.id,
                vedleggId,
            },
            () => refreshNotat(),
        );
    };

    if (RemoteData.isInitial(notatStatus) || RemoteData.isPending(notatStatus)) {
        return (
            <div className={styles.container}>
                <SpinnerMedTekst />
            </div>
        );
    }

    return (
        <Box className={styles.container} background="bg-default" padding="4">
            <div className={styles.topBar}>
                <div>
                    <Heading level="2" size="small">
                        Notat
                    </Heading>
                    <BodyShort>
                        {props.underAttestering
                            ? 'Attestant kan redigere notatet'
                            : 'Saksbehandler kan redigere notatet'}
                    </BodyShort>
                </div>
                {manglerNotat && (
                    <Button type="button" onClick={handleOpprettNotat} loading={RemoteData.isPending(opprettStatus)}>
                        Lag notat
                    </Button>
                )}
            </div>

            {RemoteData.isFailure(notatStatus) && notatStatus.error.statusCode !== 404 && (
                <ApiErrorAlert error={notatStatus.error} />
            )}

            {notat && (
                <div className={styles.content}>
                    <div className={styles.mainColumn}>
                        <Textarea
                            label={props.underAttestering ? 'Attestantnotat' : 'Saksbehandlernotat'}
                            value={notatTekst}
                            onChange={(event) => setNotatTekst(event.target.value)}
                            resize
                            minRows={5}
                        />
                        <div className={styles.buttonRow}>
                            <Button
                                type="button"
                                onClick={handleLagreNotat}
                                loading={
                                    RemoteData.isPending(lagreSaksbehandlerStatus) ||
                                    RemoteData.isPending(lagreAttestantStatus)
                                }
                            >
                                Lagre notat
                            </Button>
                        </div>

                        {notat.attestantNotat.trim() && (
                            <Accordion>
                                <AccordionItem>
                                    <AccordionHeader type="button">Vis attestantnotat</AccordionHeader>
                                    <AccordionContent>
                                        <BodyShort>{notat.attestantNotat}</BodyShort>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>

                    <div className={styles.sideColumn}>
                        <Heading level="3" size="xsmall" spacing>
                            Vedlegg
                        </Heading>
                        <FileUpload.Dropzone
                            label="Legg til vedlegg"
                            description="Last opp ett vedlegg av gangen"
                            fileLimit={{ max: 1, current: valgtFil ? 1 : 0 }}
                            onSelect={(files) => setValgtFil(files.find((f) => !f.error)?.file ?? null)}
                        />
                        {valgtFil && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleLastOppVedlegg}
                                loading={RemoteData.isPending(vedleggStatus)}
                            >
                                Last opp vedlegg
                            </Button>
                        )}
                        {valgtFil && <BodyShort className={styles.selectedFileName}>{valgtFil.name}</BodyShort>}

                        <div className={styles.vedleggListe}>
                            {notatMedVedlegg?.vedlegg.map((vedlegg) => (
                                <div key={vedlegg.id} className={styles.vedleggRad}>
                                    <BodyShort>{vedlegg.filnavn}</BodyShort>
                                    <Button
                                        type="button"
                                        variant="tertiary"
                                        onClick={() => handleSlettVedlegg(vedlegg.id)}
                                        loading={RemoteData.isPending(slettVedleggStatus)}
                                    >
                                        Slett
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default NotatPanel;

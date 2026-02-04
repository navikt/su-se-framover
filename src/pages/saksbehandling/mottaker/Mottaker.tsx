import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, Heading, HStack, Label, Loader, TextField, VStack } from '@navikt/ds-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    hentMottaker,
    LagreMottakerRequest,
    lagreMottaker,
    MottakerIdentifikator,
    MottakerResponse,
    oppdaterMottaker,
    ReferanseType,
    slettMottaker,
} from '~src/api/mottakerClient.ts';
import styles from './Mottaker.module.less';

interface MottakerFormProps {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
    onClose?: () => void;
}

type FormValues = LagreMottakerRequest;
type FeedbackVariant = 'success' | 'error' | 'info' | 'warning';
type Feedback = { text: string; variant: FeedbackVariant };
type ActionState = 'idle' | 'loading' | 'success' | 'error';

export function MottakerForm({ sakId, referanseId, referanseType, onClose }: MottakerFormProps) {
    const emptyFormValues = useMemo<FormValues>(
        () => ({
            navn: '',
            foedselsnummer: '',
            orgnummer: '',
            adresse: {
                adresselinje1: '',
                adresselinje2: '',
                adresselinje3: '',
                postnummer: '',
                poststed: '',
            },
            sakId,
            referanseType,
            referanseId,
        }),
        [referanseId, referanseType, sakId],
    );

    const { register, handleSubmit, reset, formState, setError, clearErrors, watch } = useForm<FormValues>({
        defaultValues: emptyFormValues,
    });
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [harEksisterendeMottaker, setHarEksisterendeMottaker] = useState<boolean>(false);
    const [mottakerId, setMottakerId] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<ActionState>('idle');
    const [deleteState, setDeleteState] = useState<ActionState>('idle');
    const skipClearOnChangeRef = useRef(false);

    const fyllSkjema = (mottaker: MottakerResponse) => {
        setHarEksisterendeMottaker(true);
        setMottakerId(mottaker.id);
        skipClearOnChangeRef.current = true;
        reset({
            navn: mottaker.navn ?? '',
            foedselsnummer: mottaker.foedselsnummer ?? '',
            orgnummer: mottaker.orgnummer ?? '',
            adresse: {
                adresselinje1: mottaker.adresse?.adresselinje1 ?? '',
                adresselinje2: mottaker.adresse?.adresselinje2 ?? '',
                adresselinje3: mottaker.adresse?.adresselinje3 ?? '',
                postnummer: mottaker.adresse?.postnummer ?? '',
                poststed: mottaker.adresse?.poststed ?? '',
            },
            sakId,
            referanseType,
            referanseId,
        });
    };

    useEffect(() => {
        const subscription = watch(() => {
            if (skipClearOnChangeRef.current) {
                skipClearOnChangeRef.current = false;
                return;
            }
            setSaveState('idle');
            setDeleteState('idle');
            setFeedback(null);
        });

        return () => subscription.unsubscribe();
    }, [watch]);

    useEffect(() => {
        const hentOgFyll = async () => {
            setLoading(true);
            setFeedback(null);
            setSaveState('idle');
            setDeleteState('idle');

            const res = await hentMottaker(sakId, referanseType, referanseId);

            if (res.status === 'ok') {
                if (res.data) {
                    fyllSkjema(res.data);
                    setFeedback({ text: 'Mottaker funnet – du kan oppdatere.', variant: 'info' });
                } else {
                    setHarEksisterendeMottaker(false);
                    setMottakerId(null);
                    skipClearOnChangeRef.current = true;
                    reset(emptyFormValues);
                    setFeedback({ text: 'Ingen mottaker funnet – du kan opprette ny.', variant: 'info' });
                }
            } else if (res.error.statusCode === 404) {
                setHarEksisterendeMottaker(false);
                setMottakerId(null);
                skipClearOnChangeRef.current = true;
                reset(emptyFormValues);
                setFeedback({ text: 'Ingen mottaker funnet – du kan opprette ny.', variant: 'info' });
            } else {
                setHarEksisterendeMottaker(false);
                setMottakerId(null);
                skipClearOnChangeRef.current = true;
                reset(emptyFormValues);
                setFeedback({ text: res.error.body?.message ?? 'Kunne ikke hente mottaker', variant: 'error' });
            }

            setLoading(false);
        };

        hentOgFyll();
    }, [sakId, referanseId, referanseType, reset, emptyFormValues]);

    const onSubmit = async (data: FormValues) => {
        setFeedback(null);
        clearErrors();

        const harFnr = Boolean(data.foedselsnummer?.trim());
        const harOrgnr = Boolean(data.orgnummer?.trim());
        if (harFnr && harOrgnr) {
            setError('foedselsnummer', { message: 'Kan ikke ha både fødselsnummer og organisasjonsnummer.' });
            setError('orgnummer', { message: 'Kan ikke ha både fødselsnummer og organisasjonsnummer.' });
            return;
        }
        if (!harFnr && !harOrgnr) {
            setError('foedselsnummer', { message: 'Du må fylle ut enten fødselsnummer eller organisasjonsnummer.' });
            setError('orgnummer', { message: 'Du må fylle ut enten fødselsnummer eller organisasjonsnummer.' });
            return;
        }

        const payload: LagreMottakerRequest = {
            navn: data.navn.trim(),
            foedselsnummer: data.foedselsnummer?.trim() || undefined,
            orgnummer: data.orgnummer?.trim() || undefined,
            adresse: {
                adresselinje1: data.adresse.adresselinje1.trim(),
                adresselinje2: data.adresse.adresselinje2?.trim() || undefined,
                adresselinje3: data.adresse.adresselinje3?.trim() || undefined,
                postnummer: data.adresse.postnummer.trim(),
                poststed: data.adresse.poststed.trim(),
            },
            sakId,
            referanseId,
            referanseType,
        };

        setSaveState('loading');

        if (harEksisterendeMottaker) {
            if (!mottakerId) {
                setFeedback({ text: 'Mangler mottaker-id fra backend – kan ikke oppdatere.', variant: 'error' });
                setSaveState('error');
                return;
            }
            const res = await oppdaterMottaker(sakId, { ...payload, id: mottakerId });
            if (res.status === 'ok') {
                setSaveState('success');
                skipClearOnChangeRef.current = true;
                reset({
                    ...payload,
                    adresse: { ...payload.adresse },
                });
                clearErrors();
            } else {
                setFeedback({ text: res.error.body?.message ?? 'Kunne ikke oppdatere mottaker', variant: 'error' });
                setSaveState('error');
            }
            return;
        }

        const res = await lagreMottaker(sakId, payload);
        if (res.status === 'ok') {
            setSaveState('success');
            setLoading(true);
            const hentRes = await hentMottaker(sakId, referanseType, referanseId);
            if (hentRes.status === 'ok' && hentRes.data) {
                fyllSkjema(hentRes.data);
            }
            setLoading(false);
        } else {
            setFeedback({ text: res.error.body?.message ?? 'Kunne ikke opprette mottaker', variant: 'error' });
            setSaveState('error');
        }
    };

    const handleSlett = async () => {
        setFeedback(null);
        setDeleteState('loading');

        const identifikator: MottakerIdentifikator = { referanseType, referanseId };
        const res = await slettMottaker(sakId, identifikator);

        if (res.status === 'ok') {
            setHarEksisterendeMottaker(false);
            setMottakerId(null);
            setSaveState('idle');
            setDeleteState('success');
            skipClearOnChangeRef.current = true;
            reset({
                ...emptyFormValues,
                adresse: { ...emptyFormValues.adresse },
            });
            clearErrors();
        } else {
            setFeedback({ text: res.error.body?.message ?? 'Kunne ikke slette mottaker', variant: 'error' });
            setDeleteState('error');
        }
    };

    const erOpptatt = loading || saveState === 'loading' || deleteState === 'loading';
    const submitLabel = harEksisterendeMottaker ? 'Oppdater mottaker' : 'Opprett mottaker';
    const lagreIkon = saveState === 'success' ? <CheckmarkCircleFillIcon /> : undefined;
    const slettIkon = deleteState === 'success' ? <CheckmarkCircleFillIcon /> : undefined;

    return (
        <Box background="surface-default" padding="6" borderWidth="1" borderRadius="medium" className={styles.panel}>
            <VStack gap="5">
                <HStack gap="2" align="center">
                    <Heading size="small">
                        {harEksisterendeMottaker ? 'Oppdater mottaker' : 'Legg til mottaker'}
                    </Heading>
                    {loading && <Loader size="small" title="Henter mottaker" />}
                </HStack>

                <HStack gap="6" className={styles.meta}>
                    <div>
                        <Label size="small">SakId</Label>
                        <BodyShort>{sakId}</BodyShort>
                    </div>
                    <div>
                        <Label size="small">Referanse</Label>
                        <BodyShort>
                            {referanseType} / {referanseId}
                        </BodyShort>
                    </div>
                </HStack>

                <div>
                    <fieldset disabled={erOpptatt} className={styles.fieldset}>
                        <VStack gap="4">
                            <TextField
                                label="Navn"
                                {...register('navn', { required: 'Navn er påkrevd.' })}
                                autoComplete="name"
                                error={formState.errors.navn?.message}
                            />

                            <HStack gap="4" className={styles.row}>
                                <TextField
                                    label="Fødselsnummer"
                                    {...register('foedselsnummer')}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    error={formState.errors.foedselsnummer?.message}
                                />
                                <TextField
                                    label="Organisasjonsnummer"
                                    {...register('orgnummer', {
                                        validate: (value) => {
                                            const trimmed = value?.trim();
                                            if (!trimmed) return true;
                                            return /^\d{9}$/.test(trimmed) || 'Organisasjonsnummer må være 9 siffer.';
                                        },
                                    })}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    error={formState.errors.orgnummer?.message}
                                />
                            </HStack>

                            <TextField
                                label="Adresselinje 1"
                                {...register('adresse.adresselinje1', { required: 'Adresselinje 1 er påkrevd.' })}
                                error={formState.errors.adresse?.adresselinje1?.message}
                            />
                            <HStack gap="4" className={styles.row}>
                                <TextField label="Adresselinje 2" {...register('adresse.adresselinje2')} />
                                <TextField label="Adresselinje 3" {...register('adresse.adresselinje3')} />
                            </HStack>

                            <HStack gap="4" className={styles.row}>
                                <TextField
                                    label="Postnummer"
                                    {...register('adresse.postnummer', {
                                        required: 'Postnummer er påkrevd.',
                                        pattern: {
                                            value: /^\d{4}$/,
                                            message: 'Postnummer må være 4 siffer.',
                                        },
                                    })}
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    error={formState.errors.adresse?.postnummer?.message}
                                />
                                <TextField
                                    label="Poststed"
                                    {...register('adresse.poststed', { required: 'Poststed er påkrevd.' })}
                                    autoComplete="address-level2"
                                    error={formState.errors.adresse?.poststed?.message}
                                />
                            </HStack>

                            <VStack gap="3" className={styles.actions}>
                                <HStack gap="3" className={styles.actionRow}>
                                    <Button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            handleSubmit(onSubmit)();
                                        }}
                                        loading={saveState === 'loading'}
                                        disabled={erOpptatt}
                                        icon={lagreIkon}
                                    >
                                        {submitLabel}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={handleSlett}
                                        disabled={erOpptatt || !harEksisterendeMottaker}
                                        loading={deleteState === 'loading'}
                                        icon={slettIkon}
                                    >
                                        Slett mottaker
                                    </Button>
                                </HStack>
                                {typeof onClose === 'function' && (
                                    <Button type="button" variant="secondary" onClick={onClose}>
                                        Lukk
                                    </Button>
                                )}
                            </VStack>
                        </VStack>
                    </fieldset>
                </div>

                {feedback && <Alert variant={feedback.variant}>{feedback.text}</Alert>}
            </VStack>
        </Box>
    );
}

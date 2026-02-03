import { useEffect, useMemo, useState } from 'react';
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

interface MottakerFormProps {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
}

type FormValues = LagreMottakerRequest;

export function MottakerForm({ sakId, referanseId, referanseType }: MottakerFormProps) {
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

    const { register, handleSubmit, reset, formState } = useForm<FormValues>({
        defaultValues: emptyFormValues,
    });
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [harEksisterendeMottaker, setHarEksisterendeMottaker] = useState<boolean>(false);
    const [mottakerId, setMottakerId] = useState<string | null>(null);

    const fyllSkjema = (mottaker: MottakerResponse) => {
        setHarEksisterendeMottaker(true);
        setMottakerId(mottaker.id);
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
        let aktiv = true;

        const hentOgFyll = async () => {
            setLoading(true);
            setMessage(null);

            const res = await hentMottaker(sakId, referanseType, referanseId);

            if (!aktiv) return;

            if (res.status === 'ok') {
                if (res.data) {
                    fyllSkjema(res.data);
                    setMessage('Mottaker funnet – du kan oppdatere.');
                } else {
                    setHarEksisterendeMottaker(false);
                    setMottakerId(null);
                    reset(emptyFormValues);
                    setMessage('Ingen mottaker funnet – du kan opprette ny.');
                }
            } else if (res.error.statusCode === 404) {
                setHarEksisterendeMottaker(false);
                setMottakerId(null);
                reset(emptyFormValues);
                setMessage('Ingen mottaker funnet – du kan opprette ny.');
            } else {
                setHarEksisterendeMottaker(false);
                setMottakerId(null);
                reset(emptyFormValues);
                setMessage(res.error.body?.message ?? 'Kunne ikke hente mottaker');
            }

            setLoading(false);
        };

        hentOgFyll();

        return () => {
            aktiv = false;
        };
    }, [sakId, referanseId, referanseType, reset, emptyFormValues]);

    const onSubmit = async (data: FormValues) => {
        setMessage(null);

        const harFnr = Boolean(data.foedselsnummer?.trim());
        const harOrgnr = Boolean(data.orgnummer?.trim());
        if (harFnr && harOrgnr) {
            setMessage('Du kan ikke fylle ut både fødselsnummer og organisasjonsnummer.');
            return;
        }
        if (!harFnr && !harOrgnr) {
            setMessage('Du må fylle ut enten fødselsnummer eller organisasjonsnummer.');
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

        if (harEksisterendeMottaker) {
            if (!mottakerId) {
                setMessage('Mangler mottaker-id fra backend – kan ikke oppdatere.');
                return;
            }
            const res = await oppdaterMottaker(sakId, { ...payload, id: mottakerId });
            if (res.status === 'ok') {
                setMessage('Mottaker oppdatert!');
            } else {
                setMessage(res.error.body?.message ?? 'Kunne ikke oppdatere mottaker');
            }
            return;
        }

        const res = await lagreMottaker(sakId, payload);
        if (res.status === 'ok') {
            setMessage('Mottaker opprettet!');
            setLoading(true);
            const hentRes = await hentMottaker(sakId, referanseType, referanseId);
            if (hentRes.status === 'ok' && hentRes.data) {
                fyllSkjema(hentRes.data);
            }
            setLoading(false);
        } else {
            setMessage(res.error.body?.message ?? 'Kunne ikke opprette mottaker');
        }
    };

    const handleSlett = async () => {
        setMessage(null);

        const identifikator: MottakerIdentifikator = { referanseType, referanseId };
        const res = await slettMottaker(sakId, identifikator);

        if (res.status === 'ok') {
            setHarEksisterendeMottaker(false);
            setMottakerId(null);
            reset(emptyFormValues);
            setMessage('Mottaker slettet!');
        } else {
            setMessage(res.error.body?.message ?? 'Kunne ikke slette mottaker');
        }
    };

    const erOpptatt = loading || formState.isSubmitting;
    const submitLabel = harEksisterendeMottaker ? 'Oppdater mottaker' : 'Opprett mottaker';

    return (
        <div>
            <h2>{harEksisterendeMottaker ? 'Oppdater mottaker' : 'Legg til mottaker'}</h2>
            <div>
                <fieldset disabled={erOpptatt}>
                    <input {...register('navn')} placeholder="Navn" required />
                    <input {...register('foedselsnummer')} placeholder="Fødselsnummer (valgfritt)" />
                    <input {...register('orgnummer')} placeholder="Organisasjonsnummer (valgfritt)" />
                    <input {...register('adresse.adresselinje1')} placeholder="Adresse linje 1" required />
                    <input {...register('adresse.adresselinje2')} placeholder="Adresse linje 2" />
                    <input {...register('adresse.adresselinje3')} placeholder="Adresse linje 3" />
                    <input {...register('adresse.postnummer')} placeholder="Postnummer" required />
                    <input {...register('adresse.poststed')} placeholder="Poststed" required />
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleSubmit(onSubmit)();
                        }}
                    >
                        {submitLabel}
                    </button>
                </fieldset>
            </div>

            <div style={{ marginTop: 20 }}>
                <button onClick={handleSlett} disabled={erOpptatt || !harEksisterendeMottaker}>
                    Slett mottaker
                </button>
            </div>

            {message && <div style={{ marginTop: 10 }}>{message}</div>}
        </div>
    );
}

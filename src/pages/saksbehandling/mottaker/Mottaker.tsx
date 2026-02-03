import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    hentMottaker,
    LagreMottakerRequest,
    lagreMottaker,
    MottakerIdentifikator,
    oppdaterMottaker,
    slettMottaker,
} from '~src/api/mottakerClient.ts';

interface MottakerFormProps {
    sakId: string;
    referanseId: string;
    referanseType: 'SØKNAD' | 'REVURDERING';
}

type FormValues = LagreMottakerRequest;

export function MottakerForm({ sakId, referanseId, referanseType }: MottakerFormProps) {
    const emptyFormValues = useMemo<FormValues>(
        () => ({
            navn: '',
            foedselsnummer: '',
            adresse: {
                adresselinje1: '',
                adresselinje2: '',
                adresselinje3: '',
                postnummer: '',
                poststed: '',
            },
            referanseType,
            referanseId,
        }),
        [referanseId, referanseType],
    );

    const { register, handleSubmit, reset, formState } = useForm<FormValues>({
        defaultValues: emptyFormValues,
    });
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [harEksisterendeMottaker, setHarEksisterendeMottaker] = useState<boolean>(false);

    useEffect(() => {
        let aktiv = true;

        const hentOgFyll = async () => {
            setLoading(true);
            setMessage(null);

            const res = await hentMottaker(sakId, referanseType, referanseId);

            if (!aktiv) return;

            if (res.status === 'ok' && res.data) {
                setHarEksisterendeMottaker(true);
                reset({
                    navn: res.data.navn ?? '',
                    foedselsnummer: res.data.foedselsnummer ?? '',
                    adresse: {
                        adresselinje1: res.data.adresse?.adresselinje1 ?? '',
                        adresselinje2: res.data.adresse?.adresselinje2 ?? '',
                        adresselinje3: res.data.adresse?.adresselinje3 ?? '',
                        postnummer: res.data.adresse?.postnummer ?? '',
                        poststed: res.data.adresse?.poststed ?? '',
                    },
                    referanseType,
                    referanseId,
                });
                setMessage('Mottaker funnet – du kan oppdatere.');
            } else if (res.status === 'error' && res.error.statusCode === 404) {
                setHarEksisterendeMottaker(false);
                reset(emptyFormValues);
                setMessage('Ingen mottaker funnet – du kan opprette ny.');
            } else {
                setHarEksisterendeMottaker(false);
                reset(emptyFormValues);
                setMessage(
                    res.status === 'error'
                        ? (res.error.body?.message ?? 'Kunne ikke hente mottaker')
                        : 'Kunne ikke hente mottaker',
                );
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

        const payload: LagreMottakerRequest = {
            ...data,
            referanseId,
            referanseType,
        };

        if (harEksisterendeMottaker) {
            const res = await oppdaterMottaker(sakId, payload);
            if (res.status === 'ok') {
                setMessage('Mottaker oppdatert!');
            } else {
                setMessage(res.error.body?.message ?? 'Kunne ikke oppdatere mottaker');
            }
            return;
        }

        const res = await lagreMottaker(sakId, payload);
        if (res.status === 'ok') {
            setHarEksisterendeMottaker(true);
            setMessage('Mottaker opprettet!');
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={erOpptatt}>
                    <input {...register('navn')} placeholder="Navn" required />
                    <input {...register('foedselsnummer')} placeholder="Fødselsnummer (valgfritt)" />
                    <input {...register('adresse.adresselinje1')} placeholder="Adresse linje 1" required />
                    <input {...register('adresse.adresselinje2')} placeholder="Adresse linje 2" />
                    <input {...register('adresse.adresselinje3')} placeholder="Adresse linje 3" />
                    <input {...register('adresse.postnummer')} placeholder="Postnummer" required />
                    <input {...register('adresse.poststed')} placeholder="Poststed" required />
                    <button type="submit" disabled={erOpptatt}>
                        {submitLabel}
                    </button>
                </fieldset>
            </form>

            <div style={{ marginTop: 20 }}>
                <button onClick={handleSlett} disabled={erOpptatt || !harEksisterendeMottaker}>
                    Slett mottaker
                </button>
            </div>

            {message && <div style={{ marginTop: 10 }}>{message}</div>}
        </div>
    );
}

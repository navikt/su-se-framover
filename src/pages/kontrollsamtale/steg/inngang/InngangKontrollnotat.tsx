import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyLong, BodyShort, Button, Heading, Loader, Search, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from 'src/pages/søknad/steg/inngang/inngang.module.less';
import { hentKontrollsamtaler } from '~src/api/kontrollsamtaleApi.ts';
import { hentSakinfoPåFnr } from '~src/api/sakApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import { Personkort } from '~src/components/personkort/Personkort.tsx';
import { fetchPerson } from '~src/features/person/person.slice.ts';
import { pipe } from '~src/lib/fp.ts';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
import yup from '~src/lib/validering.ts';
import nb from '~src/pages/kontrollsamtale/steg/inngang/inngang-nb.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { KontrollsamtaleStatus } from '~src/types/Kontrollsamtale.ts';
import { removeSpaces } from '~src/utils/format/formatUtils.ts';

interface PersonSøkFormData {
    fnr: string;
}

const personSøkSchema = yup.object<PersonSøkFormData>({
    fnr: yup.string().required().typeError('Ugyldig input'),
});

const InngangKontrollnotat = () => {
    const { formatMessage } = useI18n({ messages: nb });
    const [hentSakStatus, hentSak] = useApiCall(hentSakinfoPåFnr);
    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(fetchPerson);
    const [hentKontrollsamtalerStatus, hentKontrollsamtalerForSak] = useApiCall(hentKontrollsamtaler);
    const navigate = useNavigate();
    const [, setKontrollsamtalerSakId] = useState<string | null>(null);
    const [valgtSak, setValgtSak] = useState<string | null>(null);

    const { control, handleSubmit } = useForm<PersonSøkFormData>({
        defaultValues: { fnr: '' },
        resolver: yupResolver(personSøkSchema),
    });

    const kanStarteBasertPåInnkallingsdato =
        RemoteData.isSuccess(hentKontrollsamtalerStatus) &&
        hentKontrollsamtalerStatus.value.some((kontrollsamtale) =>
            kontrollsamtale.lovligeStatusovergangerForSaksbehandler.includes(KontrollsamtaleStatus.GJENNOMFØRT),
        );

    const kanStarteKontrollnotat =
        RemoteData.isSuccess(hentSakStatus) &&
        hentSakStatus.value.length > 0 &&
        valgtSak &&
        RemoteData.isSuccess(hentPersonStatus) &&
        kanStarteBasertPåInnkallingsdato;

    const submitHandler = async (formData: PersonSøkFormData) => {
        const isFnr = removeSpaces(formData.fnr).length === 11;
        if (isFnr) {
            hentSak(formData.fnr);
        }
    };

    useEffect(() => {
        if (RemoteData.isSuccess(hentSakStatus) && hentSakStatus.value.length === 1) {
            const sak = hentSakStatus.value[0];
            setValgtSak(hentSakStatus.value[0].sakId);
            hentPerson({ fnr: sak.fnr, sakstype: sak.type });
            hentKontrollsamtalerForSak({ sakId: sak.sakId }, () => setKontrollsamtalerSakId(sak.sakId));
        }
    }, [hentSakStatus]);

    return (
        <div className={styles.searchContainer}>
            <Heading level="2" size="small" spacing>
                {formatMessage('finnSøker.tittel')}
            </Heading>
            <BodyLong spacing>{formatMessage('finnSøker.tekst')} </BodyLong>

            <div className={styles.personsøk}>
                <form onSubmit={handleSubmit(submitHandler)}>
                    <Controller
                        control={control}
                        name="fnr"
                        render={({ field, fieldState }) => (
                            <Search
                                value={field.value}
                                onChange={field.onChange}
                                label={formatMessage('input.fnr.label')}
                                //TODO: onclear?
                                variant="primary"
                                error={fieldState.error?.message}
                            >
                                <Search.Button loading={RemoteData.isPending(hentPersonStatus)}>
                                    {formatMessage('knapp.søk')}
                                </Search.Button>
                            </Search>
                        )}
                    />
                </form>
                <div className={styles.personkortWrapper}>
                    {pipe(
                        hentPersonStatus,
                        RemoteData.fold(
                            () => null,
                            () => null,
                            (err) => <ApiErrorAlert error={err} />,
                            (s) => <Personkort person={s} />,
                        ),
                    )}
                </div>
                {RemoteData.isSuccess(hentSakStatus) && hentSakStatus.value.length > 1 && (
                    <>
                        <BodyShort>Velg hvilken sak du vil opprette kontrollsamtale for</BodyShort>
                        <VStack gap="2">
                            {hentSakStatus.value.map((sak) => (
                                <div key={sak.sakId}>
                                    <p>Saksnummer {sak.saksnummer}</p>
                                    <Button
                                        key={sak.sakId}
                                        onClick={() => {
                                            setValgtSak(sak.sakId);
                                            hentPerson({ fnr: sak.fnr, sakstype: sak.type });
                                            hentKontrollsamtalerForSak({ sakId: sak.sakId }, () =>
                                                setKontrollsamtalerSakId(sak.sakId),
                                            );
                                        }}
                                    >
                                        Velg sakstype {sak.type}
                                    </Button>
                                </div>
                            ))}
                        </VStack>
                    </>
                )}
                {RemoteData.isPending(hentSakStatus) && <Loader />}
                {RemoteData.isFailure(hentSakStatus) && <ApiErrorAlert error={hentSakStatus.error} />}
            </div>
            {RemoteData.isSuccess(hentSakStatus) && !kanStarteBasertPåInnkallingsdato && (
                <Alert variant={'warning'}>Personen har per nå ingen åpen kontrollsamtale.</Alert>
            )}
            <div className={styles.knapperContainer}>
                <LinkAsButton variant={kanStarteKontrollnotat ? 'secondary' : 'primary'} href={'/soknad'}>
                    {formatMessage('knapp.forrige')}
                </LinkAsButton>
                {valgtSak && (
                    <Button
                        type="button"
                        onClick={() => {
                            navigate(
                                routes.kontrollsamtaleUtfylling.createURL({
                                    step: KontrollsamtaleSteg.PersonligOppmøte,
                                    sakId: valgtSak,
                                }),
                            );
                        }}
                    >
                        Start skjema
                    </Button>
                )}
            </div>
        </div>
    );
};
export default InngangKontrollnotat;

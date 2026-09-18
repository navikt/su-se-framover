import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from 'src/pages/søknad/steg/inngang/inngang.module.less';
import { hentKontrollsamtaler } from '~src/api/kontrollsamtaleApi.ts';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import Personsøk from '~src/components/Personsøk/Personsøk.tsx';
import personSlice, { fetchPerson } from '~src/features/person/person.slice.ts';
import { fetchSakByFnr } from '~src/features/saksoversikt/sak.slice.ts';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
import nb from '~src/pages/kontrollsamtale/steg/inngang/inngang-nb.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';
import { KontrollsamtaleStatus } from '~src/types/Kontrollsamtale.ts';

const InngangKontrollnotat = () => {
    const { formatMessage } = useI18n({ messages: nb });
    const { søker } = useAppSelector((s) => s.personopplysninger);
    const dispatch = useAppDispatch();
    const [hentSakStatus, hentSak] = useAsyncActionCreator(fetchSakByFnr);
    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(fetchPerson);
    const [hentKontrollsamtalerStatus, hentKontrollsamtalerForSak] = useApiCall(hentKontrollsamtaler);
    const navigate = useNavigate();
    const [, setKontrollsamtalerSakId] = useState<string | null>(null);

    useEffect(() => {
        if (RemoteData.isSuccess(hentSakStatus) && hentSakStatus.value.length > 0) {
            const sak = hentSakStatus.value[0];
            hentPerson({ fnr: sak.fnr, sakstype: sak.sakstype });
            hentKontrollsamtalerForSak({ sakId: sak.id }, () => setKontrollsamtalerSakId(sak.id));
        }
    }, [hentSakStatus]);

    useEffect(() => {
        dispatch(personSlice.actions.resetSøkerData());
    }, [dispatch]);

    const kanStarteBasertPåInnkallingsdato =
        RemoteData.isSuccess(hentKontrollsamtalerStatus) &&
        hentKontrollsamtalerStatus.value.some((kontrollsamtale) =>
            kontrollsamtale.lovligeStatusovergangerForSaksbehandler.includes(KontrollsamtaleStatus.GJENNOMFØRT),
        );

    const harIngenKontrollsamtaler =
        RemoteData.isSuccess(hentKontrollsamtalerStatus) && hentKontrollsamtalerStatus.value.length === 0;

    const harIngenInnvilgetSu =
        RemoteData.isSuccess(hentSakStatus) &&
        hentSakStatus.value.length > 0 &&
        hentSakStatus.value[0].harInnvilgetStønadsperiode;

    const kanStarteKontrollnotat =
        RemoteData.isSuccess(hentSakStatus) &&
        hentSakStatus.value.length > 0 &&
        RemoteData.isSuccess(hentPersonStatus) &&
        !harIngenInnvilgetSu &&
        (harIngenKontrollsamtaler || kanStarteBasertPåInnkallingsdato);

    const sakIkkeFunnet = RemoteData.isFailure(hentSakStatus);
    return (
        <div className={styles.searchContainer}>
            <Heading level="2" size="small" spacing>
                {formatMessage('finnSøker.tittel')}
            </Heading>
            <BodyLong spacing>{formatMessage('finnSøker.tekst')} </BodyLong>

            <Personsøk
                person={søker}
                onReset={() => {
                    dispatch(personSlice.actions.resetSøkerData());
                }}
                onFetchByFnr={(fnr: string): void => {
                    hentSak({ fnr });
                }}
            />
            {sakIkkeFunnet && <Alert variant="error">Fant ingen sak for bruker, kan ikke starte kontrollskjema.</Alert>}
            {harIngenInnvilgetSu && (
                <Alert variant="warning" style={{ marginTop: '1rem' }}>
                    {formatMessage('varsel.ingenInnvilgetSu')}
                </Alert>
            )}
            {harIngenKontrollsamtaler && (
                <Alert variant="warning">{formatMessage('varsel.harIngenkontrollsamtale')}</Alert>
            )}
            <div className={styles.knapperContainer}>
                <LinkAsButton variant={kanStarteKontrollnotat ? 'secondary' : 'primary'} href={'/soknad'}>
                    {formatMessage('knapp.forrige')}
                </LinkAsButton>
                {kanStarteKontrollnotat && (
                    <Button
                        type="button"
                        onClick={() => {
                            navigate(
                                routes.kontrollsamtaleUtfylling.createURL({
                                    step: KontrollsamtaleSteg.PersonligOppmøte,
                                    sakId: hentSakStatus.value[0].id,
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

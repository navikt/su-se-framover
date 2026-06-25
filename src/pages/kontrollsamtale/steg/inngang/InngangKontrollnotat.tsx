import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from 'src/pages/søknad/steg/inngang/inngang.module.less';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import Personsøk from '~src/components/Personsøk/Personsøk.tsx';
import personSlice, { fetchPerson } from '~src/features/person/person.slice.ts';
import { fetchSakByFnr } from '~src/features/saksoversikt/sak.slice.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
import nb from '~src/pages/kontrollsamtale/steg/inngang/inngang-nb.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

const InngangKontrollnotat = () => {
    const { formatMessage } = useI18n({ messages: nb });
    const { søker } = useAppSelector((s) => s.personopplysninger);
    const dispatch = useAppDispatch();
    const [hentSakStatus, hentSak] = useAsyncActionCreator(fetchSakByFnr);
    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(fetchPerson);
    const navigate = useNavigate();

    useEffect(() => {
        if (RemoteData.isSuccess(hentSakStatus) && hentSakStatus.value.length > 0) {
            const sak = hentSakStatus.value[0];
            hentPerson({ fnr: sak.fnr, sakstype: sak.sakstype });
        }
    }, [hentSakStatus]);

    useEffect(() => {
        dispatch(personSlice.actions.resetSøkerData());
    }, [dispatch]);

    const kanStarteKontrollnotat =
        RemoteData.isSuccess(hentSakStatus) && hentSakStatus.value.length > 0 && RemoteData.isSuccess(hentPersonStatus);
    const sakIkkeFunnet = RemoteData.isFailure(hentSakStatus);
    return (
        <div className={styles.searchContainer}>
            <Heading level="2" size="small" spacing>
                {formatMessage('finnSøker.tittel')}
            </Heading>
            <BodyLong spacing>{formatMessage('finnSøker.tekst')}</BodyLong>

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

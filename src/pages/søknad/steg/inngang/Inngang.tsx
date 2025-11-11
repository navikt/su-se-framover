import * as RemoteData from '@devexperts/remote-data-ts';
import { PaperclipIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, ConfirmationPanel, Heading, Link, Tag } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as sakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { LinkAsButton } from '~src/components/linkAsButton/LinkAsButton';
import Personsøk from '~src/components/Personsøk/Personsøk';
import * as personSlice from '~src/features/person/person.slice';
import søknadSlice from '~src/features/søknad/søknad.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { soknadsutfylling, urlForSakstype } from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { SøknadContext } from '~src/pages/søknad';
import { Alderssteg, Uføresteg } from '~src/pages/søknad/types';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Periode } from '~src/types/Periode';
import { AlleredeGjeldendeSakForBruker, Sakstype } from '~src/types/Sak';
import { Søknadstype } from '~src/types/Søknadinnhold';
import { formatDate } from '~src/utils/date/dateUtils';
import { er67EllerEldre } from '~src/utils/person/personUtils';
import styles from './inngang.module.less';
import nb from './inngang-nb';

const Aldersvarsel = ({ søkerAlder }: { søkerAlder: Nullable<number> }) => {
    const { formatMessage } = useI18n({ messages: nb });
    const { sakstype } = useOutletContext<SøknadContext>();

    if (!skalViseAldersvarsel(søkerAlder, sakstype)) {
        return null;
    }

    const suAndreSkjemaLenke = lenkeTilMotsattSkjema(sakstype);
    return (
        <div>
            <Heading level="2" size="small" spacing>
                {formatMessage('heading.advarsel.alder')}
            </Heading>
            <BodyLong>
                {formatMessage(
                    getSøknadstematekst(sakstype, {
                        [Sakstype.Uføre]: 'advarsel.alder.uføre',
                        [Sakstype.Alder]: 'advarsel.alder.alder',
                    }),
                    {
                        navLink: (tekst) => (
                            <Link target="_blank" href={suAndreSkjemaLenke}>
                                {tekst}
                            </Link>
                        ),
                    },
                )}
            </BodyLong>
        </div>
    );
};

const IverksattInnvilgetStønadsperiodeAlert = ({
    iverksattInnvilgetStønadsperiode,
    type,
}: {
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
    type: Sakstype;
}) => {
    const { formatMessage } = useI18n({ messages: nb });
    const { sakstype } = useOutletContext<SøknadContext>();
    if (iverksattInnvilgetStønadsperiode == null) {
        return null;
    }

    const typeErSammeSomTema = sakstype === type;
    return (
        <div>
            <Heading level="2" size="small" spacing>
                {formatMessage(`heading.løpendeYtelse.${type}`)}
            </Heading>
            <BodyLong>
                {formatMessage(`åpenSøknad.løpendeYtelse${typeErSammeSomTema ? '' : '.kort'}`, {
                    løpendePeriode: `${formatDate(iverksattInnvilgetStønadsperiode.fraOgMed)} - ${formatDate(
                        iverksattInnvilgetStønadsperiode.tilOgMed,
                    )}`,
                    tidligestNyPeriode: formatDate(
                        DateFns.startOfMonth(new Date(iverksattInnvilgetStønadsperiode.tilOgMed)).toString(),
                    ),
                    type: formatMessage(type),
                })}
            </BodyLong>
        </div>
    );
};

const ÅpenSøknadVarsel = ({ alleredeÅpenSakInfo }: { alleredeÅpenSakInfo: AlleredeGjeldendeSakForBruker }) => {
    const { alder, uføre } = alleredeÅpenSakInfo;
    const { formatMessage } = useI18n({ messages: nb });
    const { sakstype } = useOutletContext<SøknadContext>();

    const suAndreSkjemaLenke = lenkeTilMotsattSkjema(sakstype);

    if (!alder.harÅpenSøknad && !uføre.harÅpenSøknad) {
        return null;
    }

    return (
        <>
            {alder.harÅpenSøknad && (
                <div>
                    <Heading level="2" size="small" spacing>
                        {formatMessage(
                            getSøknadstematekst(sakstype, {
                                [Sakstype.Alder]: 'heading.åpenSøknad',
                                [Sakstype.Uføre]: 'heading.åpenSøknad.uføre',
                            }),
                        )}
                    </Heading>
                    <BodyLong>
                        {formatMessage(
                            getSøknadstematekst(sakstype, {
                                [Sakstype.Uføre]: 'feil.harÅpenSøknad.motsatt-uføre',
                                [Sakstype.Alder]: 'feil.harÅpenSøknad',
                            }),
                            {
                                navLink: (tekst) => (
                                    <Link target="_blank" href={suAndreSkjemaLenke}>
                                        {tekst}
                                    </Link>
                                ),
                            },
                        )}
                    </BodyLong>
                </div>
            )}
            {uføre.harÅpenSøknad && (
                <div>
                    <Heading level="2" size="small" spacing>
                        {formatMessage(
                            getSøknadstematekst(sakstype, {
                                [Sakstype.Alder]: 'heading.åpenSøknad.alder',
                                [Sakstype.Uføre]: 'heading.åpenSøknad',
                            }),
                        )}
                    </Heading>
                    <BodyLong>
                        {formatMessage(
                            getSøknadstematekst(sakstype, {
                                [Sakstype.Uføre]: 'feil.harÅpenSøknad',
                                [Sakstype.Alder]: 'feil.harÅpenSøknad.motsatt-alder',
                            }),
                            {
                                navLink: (tekst) => (
                                    <Link target="_blank" href={suAndreSkjemaLenke}>
                                        {tekst}
                                    </Link>
                                ),
                            },
                        )}
                    </BodyLong>
                </div>
            )}
        </>
    );
};

const SakinfoAlertContainer = ({
    alleredeÅpenSakInfo,
    søkerAlder,
}: {
    alleredeÅpenSakInfo: AlleredeGjeldendeSakForBruker;
    søkerAlder: Nullable<number>;
}) => {
    const { sakstype } = useOutletContext<SøknadContext>();
    const visAldersvarsel = skalViseAldersvarsel(søkerAlder, sakstype);

    if (
        !visAldersvarsel &&
        !alleredeÅpenSakInfo.alder.harÅpenSøknad &&
        !alleredeÅpenSakInfo.uføre.harÅpenSøknad &&
        alleredeÅpenSakInfo.alder.iverksattInnvilgetStønadsperiode === null &&
        alleredeÅpenSakInfo.uføre.iverksattInnvilgetStønadsperiode === null
    ) {
        return null;
    }
    return (
        <Alert className={styles.åpenSøknadContainer} variant="warning">
            <ÅpenSøknadVarsel alleredeÅpenSakInfo={alleredeÅpenSakInfo} />
            <IverksattInnvilgetStønadsperiodeAlert
                type={Sakstype.Uføre}
                iverksattInnvilgetStønadsperiode={alleredeÅpenSakInfo.uføre.iverksattInnvilgetStønadsperiode}
            />
            <IverksattInnvilgetStønadsperiodeAlert
                type={Sakstype.Alder}
                iverksattInnvilgetStønadsperiode={alleredeÅpenSakInfo.alder.iverksattInnvilgetStønadsperiode}
            />
            <Aldersvarsel søkerAlder={søkerAlder} />
        </Alert>
    );
};

const Inngang = () => {
    const { isPapirsøknad, sakstype } = useOutletContext<SøknadContext>();
    const startstegUrl = soknadsutfylling.createURL({
        step: sakstype === Sakstype.Uføre ? Uføresteg.Uførevedtak : Alderssteg.Alderspensjon,
        soknadstema: urlForSakstype(sakstype),
        papirsøknad: isPapirsøknad,
    });
    const { søker } = useAppSelector((s) => s.personopplysninger);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [erBekreftet, setErBekreftet] = useState<boolean>(false);

    const { formatMessage } = useI18n({ messages: nb });

    useEffect(() => {
        dispatch(søknadSlice.actions.resetSøknad());
    }, [søker]);

    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(personSlice.fetchPerson);
    const [sakinfo, hentSakinfo] = useApiCall(sakApi.hentBegrensetSakinfo);

    const isFormValid = RemoteData.isSuccess(søker) && (isPapirsøknad || erBekreftet);

    const handleStartSøknadKlikk = () => {
        if (isFormValid) {
            dispatch(
                søknadSlice.actions.startSøknad(isPapirsøknad ? Søknadstype.Papirsøknad : Søknadstype.DigitalSøknad),
            );
            navigate(startstegUrl);
        }
    };

    const Informasjon = () => (
        <div>
            <section>
                <BodyLong spacing>{formatMessage('sendeInnDokumentasjon.dokGjelder')}</BodyLong>

                <BodyLong as="div" spacing>
                    {formatMessage('sendeInnDokumentasjon.måLeggesVed')}
                    <ul className={styles.list}>
                        <li className={styles.listItem}>{formatMessage('sendeInnDokumentasjon.måLeggesVed.punkt1')}</li>
                        <li className={styles.listItem}>{formatMessage('sendeInnDokumentasjon.måLeggesVed.punkt2')}</li>
                    </ul>
                </BodyLong>

                <BodyLong as="div" spacing>
                    {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed')}
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed.punkt1')}
                        </li>
                        <li className={styles.listItem}>
                            {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed.punkt2')}
                        </li>
                    </ul>
                </BodyLong>
            </section>

            <div className={styles.checkboksPanelContainer}>
                <ConfirmationPanel
                    checked={erBekreftet}
                    label={formatMessage('bekreftelsesboks.tekst.p2')}
                    onChange={() => setErBekreftet(!erBekreftet)}
                    error={hasSubmitted && !erBekreftet}
                >
                    {formatMessage('bekreftelsesboks.tekst.p1')}
                </ConfirmationPanel>
                {hasSubmitted && !erBekreftet && (
                    <SkjemaelementFeilmelding>{formatMessage('feil.påkrevdFelt')}</SkjemaelementFeilmelding>
                )}
            </div>
        </div>
    );

    const handleSøk = async (fnr: string): Promise<void> => {
        hentPerson({ fnr });
        hentSakinfo(fnr);
    };
    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="xlarge" spacing className={styles.heading}>
                {isPapirsøknad ? (
                    formatMessage('page.tittel.papirSøknad')
                ) : (
                    <>
                        <CircleWithIcon icon={<PaperclipIcon />} variant="yellow" />
                        {formatMessage('page.tittel.digitalSøknad')}
                    </>
                )}
            </Heading>

            {!isPapirsøknad && <Informasjon />}

            <div className={styles.searchContainer}>
                <Heading level="2" size="small" spacing>
                    {formatMessage('finnSøker.tittel')}
                </Heading>
                <BodyLong spacing>{formatMessage('finnSøker.tekst')}</BodyLong>
                <div>
                    <Personsøk
                        onReset={() => {
                            dispatch(personSlice.default.actions.resetSøkerData());
                        }}
                        onFetchByFnr={handleSøk}
                        person={søker}
                    />
                    {pipe(
                        RemoteData.combine(sakinfo, hentPersonStatus),
                        RemoteData.map(([begrensetSakInfo, { fødsel }]) => (
                            <SakinfoAlertContainer
                                key={fødsel?.alder}
                                alleredeÅpenSakInfo={begrensetSakInfo}
                                søkerAlder={fødsel?.alder ?? null}
                            />
                        )),
                        RemoteData.getOrElse(() => null as ReactNode),
                    )}
                    {/* Vi ønsker ikke å vise en feil dersom personkallet ikke er 2xx eller sakskallet ga 404  */}
                    {RemoteData.isSuccess(hentPersonStatus) &&
                        RemoteData.isFailure(sakinfo) &&
                        sakinfo.error?.statusCode !== 404 && <ApiErrorAlert error={sakinfo.error} />}
                    {hasSubmitted && RemoteData.isInitial(søker) && (
                        <Tag variant="error">{formatMessage('feil.måSøkePerson')}</Tag>
                    )}
                </div>
            </div>
            <div className={styles.knapperContainer}>
                <LinkAsButton variant="secondary" href={'/soknad'}>
                    {formatMessage('knapp.forrige')}
                </LinkAsButton>
                <Button
                    type="button"
                    onClick={() => {
                        setHasSubmitted(() => true);
                        handleStartSøknadKlikk();
                    }}
                >
                    {formatMessage('knapp.startSøknad')}
                </Button>
            </div>
        </div>
    );
};

function skalViseAldersvarsel(alder: Nullable<number>, sakstype: Sakstype): boolean {
    if (alder == null) {
        return false;
    }
    const erOver67år = er67EllerEldre(alder);
    if (sakstype === Sakstype.Uføre) {
        return erOver67år;
    } else {
        return !erOver67år;
    }
}
const SU_ALDER_URL = 'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-personer-over-sekstisyv-ar';
const SU_UFØRE_URL = 'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-ufor-flyktning';

function lenkeTilMotsattSkjema(skjema: Sakstype): string {
    switch (skjema) {
        case Sakstype.Alder:
            return SU_UFØRE_URL;
        case Sakstype.Uføre:
            return SU_ALDER_URL;
    }
}

export default Inngang;

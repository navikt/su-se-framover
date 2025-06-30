import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, CopyButton, Loader, Tag } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import { fetchPerson } from '~src/api/personApi';
import { hentEpsSaksIderForDenneSak } from '~src/api/sakApi';
import { KjønnUkjent } from '~src/assets/Icons';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Person, Sivilstand as ISivilstand, SivilstandTyper } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak.ts';
import { formatFnr, showName } from '~src/utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';
import { createToast, ToastType, useToast } from '../toast/Toast';

import messages from './personlinje-nb';
import styles from './personlinje.module.less';

const Separator = () => (
    <BodyShort as="span" className={styles.separator}>
        /
    </BodyShort>
);

const Personlinje = (props: { søker: Person; sakInfo: { sakId: string; saksnummer: number; sakstype: Sakstype } }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <div className={styles.personInformasjon}>
                <span className={styles.icon}>
                    <KjønnUkjent size="24px" />
                </span>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakInfo.sakId })}>
                    <BodyShort as="span" className={styles.navn}>
                        {showName(props.søker.navn)}
                    </BodyShort>
                </Link>
                <Separator />
                <CopyButton
                    copyText={props.søker.fnr}
                    activeText={formatMessage('ariaLabel.kopierteFnr')}
                    size="small"
                    text={formatFnr(props.søker.fnr)}
                />

                <Separator />
                <span className={styles.saksnummer}>
                    <BodyShort as="span">{formatMessage('label.saksnummer')}&nbsp;</BodyShort>
                    <CopyButton
                        copyText={props.sakInfo.saksnummer.toString()}
                        activeText={formatMessage('ariaLabel.kopierteSaksnummer')}
                        size="small"
                        text={props.sakInfo.saksnummer.toString()}
                    />
                </span>
                <Separator />
                <BodyShort>
                    <Tag variant={props.sakInfo.sakstype === Sakstype.Alder ? 'alt1' : 'alt2'}>
                        {storForBokstav(props.sakInfo.sakstype)}
                    </Tag>
                </BodyShort>
                {props.søker.sivilstand ? (
                    <span className={styles.sivilstandAndSeperator}>
                        <Separator />
                        <Sivilstand sakId={props.sakInfo.sakId} sivilstand={props.søker.sivilstand} />
                    </span>
                ) : (
                    <EpsSakLinkUtenSivilstand sakId={props.sakInfo.sakId} />
                )}
            </div>
            <PersonAdvarsel person={props.søker} />
        </div>
    );
};

export const storForBokstav = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const EpsSakLinkUtenSivilstand = (props: { sakId: string }) => {
    const { insert } = useToast();

    const [hentEpsSaksIderStatus, hentEpsSaksIder] = useApiCall(hentEpsSaksIderForDenneSak);

    useEffect(() => {
        hentEpsSaksIder(props.sakId);
    }, [props.sakId]);

    useEffect(() => {
        if (RemoteData.isFailure(hentEpsSaksIderStatus)) {
            insert(
                createToast({
                    type: ToastType.ERROR,
                    duration: 5000,
                    message: 'En feil skjedde ved sjekk om eps har sak',
                }),
            );
        }

        if (RemoteData.isSuccess(hentEpsSaksIderStatus) && hentEpsSaksIderStatus.value.length > 1) {
            insert(
                createToast({
                    type: ToastType.INFO,
                    duration: 5000,
                    message: 'Saken har flere EPS som har SU-uføre sak',
                }),
            );
        }
    }, [hentEpsSaksIderStatus._tag]);

    return pipe(
        hentEpsSaksIderStatus,
        RemoteData.fold(
            () => null,
            () => <Loader />,
            () => null,
            (epsSaker) => (
                <div>
                    {epsSaker.length === 1 ? (
                        <Alert variant="info">
                            <BodyShort>Saken har EPS registrert fra vedtak, men fant ikke fra PDL</BodyShort>
                            <Link
                                target="_blank"
                                to={Routes.saksoversiktValgtSak.createURL({
                                    sakId: epsSaker[0],
                                })}
                            >
                                <BodyShort>Gå til EPS-sak</BodyShort>
                            </Link>
                        </Alert>
                    ) : null}
                </div>
            ),
        ),
    );
};

const Sivilstand = (props: { sakId: string; sivilstand: ISivilstand }) => {
    const { formatMessage } = useI18n({ messages });

    const { insert } = useToast();
    const [status, hentPerson] = useApiCall(fetchPerson);
    const [hentEpsSaksIderStatus, hentEpsSaksIder] = useApiCall(hentEpsSaksIderForDenneSak);

    useEffect(() => {
        if (props.sivilstand.relatertVedSivilstand) {
            hentPerson(props.sivilstand.relatertVedSivilstand);
        }
    }, []);

    useEffect(() => {
        if (props.sivilstand.relatertVedSivilstand) {
            hentEpsSaksIder(props.sakId);
        }
    }, [props.sivilstand.relatertVedSivilstand]);

    useEffect(() => {
        if (RemoteData.isFailure(hentEpsSaksIderStatus)) {
            insert(
                createToast({
                    type: ToastType.ERROR,
                    duration: 5000,
                    message: 'En feil skjedde ved sjekk om eps har sak',
                }),
            );
        }

        if (RemoteData.isSuccess(hentEpsSaksIderStatus) && hentEpsSaksIderStatus.value.length > 1) {
            insert(
                createToast({
                    type: ToastType.INFO,
                    duration: 5000,
                    message: 'Saken har flere EPS som har SU-uføre sak',
                }),
            );
        }
    }, [hentEpsSaksIderStatus._tag]);

    return (
        <span className={styles.sivilstand}>
            <BodyShort as="span">
                {formatMessage('label.sivilstand')}: {formatSivilstandType(props.sivilstand.type, formatMessage)}
            </BodyShort>
            {pipe(
                status,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => (
                        <Alert variant="error">
                            {err?.statusCode === ErrorCode.Unauthorized
                                ? formatMessage('feilmelding.ikkeTilgang')
                                : err?.statusCode === ErrorCode.NotFound
                                  ? formatMessage('feilmelding.ikkeFunnet')
                                  : formatMessage('feilmelding.ukjent')}
                        </Alert>
                    ),
                    (eps) => (
                        <span className={styles.epsInformasjon}>
                            <KjønnUkjent size="24px" />
                            {RemoteData.isSuccess(hentEpsSaksIderStatus) && hentEpsSaksIderStatus.value.length === 1 ? (
                                <Link
                                    target="_blank"
                                    to={Routes.saksoversiktValgtSak.createURL({
                                        sakId: hentEpsSaksIderStatus.value[0],
                                    })}
                                >
                                    <BodyShort>{showName(eps.navn)}</BodyShort>
                                </Link>
                            ) : (
                                <BodyShort>{showName(eps.navn)}</BodyShort>
                            )}
                            <CopyButton
                                copyText={eps.fnr}
                                activeText={formatMessage('ariaLabel.kopierteFnr')}
                                size="small"
                                text={formatFnr(eps.fnr)}
                            />
                        </span>
                    ),
                ),
            )}
        </span>
    );
};

const formatSivilstandType = (
    sivilstandType: SivilstandTyper,
    formatMessage: (string: keyof typeof messages) => string,
) => {
    switch (sivilstandType) {
        case SivilstandTyper.UOPPGITT:
            return formatMessage('sivilstand.type.uoppgitt');
        case SivilstandTyper.UGIFT:
            return formatMessage('sivilstand.type.ugift');
        case SivilstandTyper.GIFT:
            return formatMessage('sivilstand.type.gift');
        case SivilstandTyper.ENKE_ELLER_ENKEMANN:
            return formatMessage('sivilstand.type.enkeEllerEnkemann');
        case SivilstandTyper.SKILT:
            return formatMessage('sivilstand.type.skilt');
        case SivilstandTyper.SEPARERT:
            return formatMessage('sivilstand.type.separert');
        case SivilstandTyper.REGISTRERT_PARTNER:
            return formatMessage('sivilstand.type.registrertPartner');
        case SivilstandTyper.SEPARERT_PARTNER:
            return formatMessage('sivilstand.type.separertPartner');
        case SivilstandTyper.SKILT_PARTNER:
            return formatMessage('sivilstand.type.skiltPartner');
        case SivilstandTyper.GJENLEVENDE_PARTNER:
            return formatMessage('sivilstand.type.gjenlevendePartner');
    }
};

export default Personlinje;

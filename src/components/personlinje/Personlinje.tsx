import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, CopyButton, Loader } from '@navikt/ds-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import { fetchPerson } from '~src/api/personApi';
import { KjønnUkjent } from '~src/assets/Icons';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Person, SivilstandTyper, Sivilstand as ISivilstand } from '~src/types/Person';
import { showName, formatFnr } from '~src/utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import messages from './personlinje-nb';
import * as styles from './personlinje.module.less';

const Separator = () => (
    <BodyShort as="span" className={styles.separator}>
        /
    </BodyShort>
);

const Personlinje = (props: { søker: Person; sakInfo: { sakId: string; saksnummer: number } }) => {
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
                {props.søker.sivilstand && (
                    <span className={styles.sivilstandAndSeperator}>
                        <Separator />
                        <Sivilstand sivilstand={props.søker.sivilstand} />
                    </span>
                )}
            </div>
            <PersonAdvarsel person={props.søker} />
        </div>
    );
};

const Sivilstand = (props: { sivilstand: ISivilstand }) => {
    const { formatMessage } = useI18n({ messages });

    const [status, hentPerson] = useApiCall(fetchPerson);

    React.useEffect(() => {
        if (props.sivilstand.relatertVedSivilstand) {
            hentPerson(props.sivilstand.relatertVedSivilstand);
        }
    }, []);

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
                            <BodyShort>{showName(eps.navn)}</BodyShort>
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

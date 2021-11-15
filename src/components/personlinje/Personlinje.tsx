import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Loader } from '@navikt/ds-react';
import { CopyToClipboard } from '@navikt/ds-react-internal';
import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import { fetchPerson, Kjønn, Person, Sivilstand as ISivilstand, SivilstandTyper } from '~api/personApi';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { showName, formatFnr } from '~utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import GenderIcon from './GenderIcon';
import messages from './personlinje-nb';
import styles from './personlinje.module.less';

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
                    <GenderIcon kjønn={props.søker.kjønn ?? Kjønn.Ukjent} />
                </span>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakInfo.sakId })}>
                    <BodyShort as="span" className={styles.navn}>
                        {showName(props.søker.navn)}
                    </BodyShort>
                </Link>
                <Separator />
                <CopyToClipboard
                    copyText={props.søker.fnr}
                    popoverText={formatMessage('ariaLabel.kopierteFnr')}
                    size="small"
                >
                    {formatFnr(props.søker.fnr)}
                </CopyToClipboard>
                <Separator />
                <span className={styles.saksnummer}>
                    <BodyShort as="span">{formatMessage('label.saksnummer')}&nbsp;</BodyShort>
                    <CopyToClipboard
                        copyText={props.sakInfo.saksnummer.toString()}
                        popoverText={formatMessage('ariaLabel.kopierteSaksnummer')}
                        size="small"
                    >
                        {props.sakInfo.saksnummer}
                    </CopyToClipboard>
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
                            <GenderIcon kjønn={eps.kjønn ?? Kjønn.Ukjent} />
                            <BodyShort>{showName(eps.navn)}</BodyShort>
                            <CopyToClipboard
                                copyText={formatFnr(eps.fnr)}
                                popoverText={formatMessage('ariaLabel.kopierteFnr')}
                                size="small"
                            >
                                {formatFnr(eps.fnr)}
                            </CopyToClipboard>
                        </span>
                    )
                )
            )}
        </span>
    );
};

const formatSivilstandType = (
    sivilstandType: SivilstandTyper,
    formatMessage: (string: keyof typeof messages) => string
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

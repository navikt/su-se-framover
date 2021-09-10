import * as RemoteData from '@devexperts/remote-data-ts';
import Clipboard from '@navikt/nap-clipboard';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst } from 'nav-frontend-typografi';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import { fetchPerson, Kjønn, Person, Sivilstand as ISivilstand, SivilstandTyper } from '~api/personApi';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';
import { showName, formatFnr } from '~utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import GenderIcon from './GenderIcon';
import messages from './personlinje-nb';
import styles from './personlinje.module.less';

const Separator = () => (
    <Normaltekst tag="span" className={styles.separator}>
        /
    </Normaltekst>
);

const Personlinje = (props: { søker: Person; sak: Sak }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <div className={styles.personInformasjon}>
                <span className={styles.icon}>
                    <GenderIcon kjønn={props.søker.kjønn ?? Kjønn.Ukjent} />
                </span>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    <Normaltekst tag="span" className={styles.navn}>
                        {showName(props.søker.navn)}
                    </Normaltekst>
                </Link>
                <Separator />
                <Clipboard buttonLabel={formatMessage('ariaLabel.kopierFnr')}>
                    <Normaltekst tag="span">{props.sak.fnr}</Normaltekst>
                </Clipboard>
                <Separator />
                <span className={styles.saksnummer}>
                    <Normaltekst tag="span">{formatMessage('label.saksnummer')}&nbsp;</Normaltekst>
                    <Clipboard buttonLabel={formatMessage('ariaLabel.kopierSaksnummer')}>
                        <Normaltekst>{props.sak.saksnummer.toString()}</Normaltekst>
                    </Clipboard>
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
            <Normaltekst tag="span">
                {formatMessage('label.sivilstand')}: {formatSivilstandType(props.sivilstand.type, formatMessage)}
            </Normaltekst>

            {pipe(
                status,
                RemoteData.fold(
                    () => null,
                    () => <NavFrontendSpinner />,
                    (err) => (
                        <AlertStripe type="feil">
                            {err?.statusCode === ErrorCode.Unauthorized
                                ? formatMessage('feilmelding.ikkeTilgang')
                                : err?.statusCode === ErrorCode.NotFound
                                ? formatMessage('feilmelding.ikkeFunnet')
                                : formatMessage('feilmelding.ukjent')}
                        </AlertStripe>
                    ),
                    (eps) => (
                        <span className={styles.epsInformasjon}>
                            <GenderIcon kjønn={eps.kjønn ?? Kjønn.Ukjent} />
                            <Normaltekst>{showName(eps.navn)}</Normaltekst>
                            <Clipboard buttonLabel={formatMessage('ariaLabel.kopierFnr')}>
                                <Normaltekst tag="span">{formatFnr(eps.fnr)}</Normaltekst>
                            </Clipboard>
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

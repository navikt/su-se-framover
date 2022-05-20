import { BodyLong, GuidePanel, Heading, Ingress, Link } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import { soknadPersonSøk } from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { Søknadstema } from '~src/types/Søknad';

import messages from './infoside-nb';
import * as styles from './infoside.module.less';

const Infoside = () => {
    const { isPapirsøknad, soknadstema } = useOutletContext<SøknadContext>();
    const nesteUrl = soknadPersonSøk.createURL({
        soknadstema,
        papirsøknad: isPapirsøknad,
    });

    const merOmSuAlderLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-personer-med-kort-botid-i-norge';
    const suAlderLink =
        'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-personer-over-sekstisyv-ar';
    const suUførFlyktningLink = 'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-ufor-flyktning';
    const merOmSuForUføreLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-ufore-flyktninger';
    const personvernLink = 'https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten';

    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.pageContainer}>
            <GuidePanel className={styles.guide}>
                <BodyLong>
                    {formatMessage(
                        getSøknadstematekst(soknadstema, {
                            [Søknadstema.Uføre]: 'suppstønadInfo.kanFåSupp.ufør',
                            [Søknadstema.Alder]: 'suppstønadInfo.kanFåSupp.alder',
                        }),
                        {
                            strong: (text) => <strong>{text}</strong>,
                        }
                    )}
                </BodyLong>
            </GuidePanel>

            <Heading level="1" size="xlarge" spacing>
                {getSøknadstematekst(soknadstema, {
                    [Søknadstema.Uføre]: formatMessage('page.tittel.uføre'),
                    [Søknadstema.Alder]: formatMessage('page.tittel.alder'),
                })}
            </Heading>

            <section className={styles.section}>
                <Ingress spacing>
                    {getSøknadstematekst(soknadstema, {
                        [Søknadstema.Uføre]: formatMessage('suppstønadInfo.ingress.ufør'),
                        [Søknadstema.Alder]: formatMessage('suppstønadInfo.ingress.alder'),
                    })}
                </Ingress>
                <BodyLong>
                    <Link
                        target="_blank"
                        href={getSøknadstematekst(soknadstema, {
                            [Søknadstema.Uføre]: merOmSuForUføreLink,
                            [Søknadstema.Alder]: merOmSuAlderLink,
                        })}
                    >
                        {getSøknadstematekst(soknadstema, {
                            [Søknadstema.Uføre]: formatMessage('suppstønad.merOmSuForUføre'),
                            [Søknadstema.Alder]: formatMessage('suppstønad.merOmSuAlder'),
                        })}
                    </Link>
                </BodyLong>
            </section>

            <section className={styles.section}>
                <Heading level="2" size="small" spacing>
                    {formatMessage('henterInnInfo.ingress')}
                </Heading>
                <BodyLong>{formatMessage('henterInnInfo.viHenterInfo')}</BodyLong>
                <BodyLong spacing as="ul" className={styles.list}>
                    <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.personinfo')}</li>
                    <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.arbeidsforhold')}</li>
                    <li className={styles.listItem}>
                        {formatMessage(
                            getSøknadstematekst(soknadstema, {
                                [Søknadstema.Uføre]: 'henterInnInfo.viHenter.flyktningsstatus',
                                [Søknadstema.Alder]: 'henterInnInfo.viHenter.oppholdstillatelse',
                            })
                        )}
                    </li>
                </BodyLong>
                <BodyLong spacing>{formatMessage('henterInnInfo.brukerTidligereOpplysninger')}</BodyLong>

                <BodyLong>
                    <Link target="_blank" href={personvernLink}>
                        {formatMessage('henterInnInfo.personvernLinkTekst')}
                    </Link>
                </BodyLong>
            </section>

            <section className={styles.section}>
                <Heading level="2" size="small" spacing>
                    {formatMessage('viktigÅVite.ingress')}
                </Heading>
                <BodyLong spacing>{formatMessage('viktigÅVite.blirIkkeLagret')}</BodyLong>
                <BodyLong spacing>
                    {formatMessage('viktigÅVite.manglerDuDokumentasjon', {
                        navLink: (tekst) => (
                            <Link
                                target="_blank"
                                href={getSøknadstematekst(soknadstema, {
                                    [Søknadstema.Uføre]: suUførFlyktningLink,
                                    [Søknadstema.Alder]: suAlderLink,
                                })}
                            >
                                {tekst}
                            </Link>
                        ),
                    })}
                </BodyLong>
            </section>

            <LinkAsButton variant="primary" href={nesteUrl} className={styles.knapp}>
                {formatMessage('knapp.neste')}
            </LinkAsButton>
        </div>
    );
};

export default Infoside;

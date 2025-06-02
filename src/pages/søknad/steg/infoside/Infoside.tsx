import { BodyLong, GuidePanel, Heading, Ingress, Link } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import { soknadPersonSøk, urlForSakstype } from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { Sakstype } from '~src/types/Sak';

import messages from './infoside-nb';
import styles from './infoside.module.less';

const Infoside = () => {
    const { isPapirsøknad, sakstype } = useOutletContext<SøknadContext>();
    const nesteUrl = soknadPersonSøk.createURL({
        soknadstema: urlForSakstype(sakstype),
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
                        getSøknadstematekst(sakstype, {
                            [Sakstype.Uføre]: 'suppstønadInfo.kanFåSupp.ufør',
                            [Sakstype.Alder]: 'suppstønadInfo.kanFåSupp.alder',
                        }),
                        {
                            strong: (text) => <strong>{text}</strong>,
                        },
                    )}
                </BodyLong>
            </GuidePanel>

            <Heading level="1" size="xlarge" spacing>
                {getSøknadstematekst(sakstype, {
                    [Sakstype.Uføre]: formatMessage('page.tittel.uføre'),
                    [Sakstype.Alder]: formatMessage('page.tittel.alder'),
                })}
            </Heading>
            <section className={styles.section}>
                <Ingress spacing>
                    {getSøknadstematekst(sakstype, {
                        [Sakstype.Uføre]: formatMessage('suppstønadInfo.ingress.ufør'),
                        [Sakstype.Alder]: formatMessage('suppstønadInfo.ingress.alder'),
                    })}
                </Ingress>
                <BodyLong>
                    <Link
                        target="_blank"
                        href={getSøknadstematekst(sakstype, {
                            [Sakstype.Uføre]: merOmSuForUføreLink,
                            [Sakstype.Alder]: merOmSuAlderLink,
                        })}
                    >
                        {getSøknadstematekst(sakstype, {
                            [Sakstype.Uføre]: formatMessage('suppstønad.merOmSuForUføre'),
                            [Sakstype.Alder]: formatMessage('suppstønad.merOmSuAlder'),
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
                            getSøknadstematekst(sakstype, {
                                [Sakstype.Uføre]: 'henterInnInfo.viHenter.flyktningsstatus',
                                [Sakstype.Alder]: 'henterInnInfo.viHenter.oppholdstillatelse',
                            }),
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
                                href={getSøknadstematekst(sakstype, {
                                    [Sakstype.Uføre]: suUførFlyktningLink,
                                    [Sakstype.Alder]: suAlderLink,
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

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
    const suUførFlyktningLink = 'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-ufor-flyktning';
    const merOmSuForUføreLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-ufore-flyktninger';
    const personvernLink = 'https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten';

    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.pageContainer}>
            <GuidePanel className={styles.guide}>
                <BodyLong>
                    {formatMessage('suppstønadInfo.kanFåSupp', {
                        b: (text) => <b>{text}</b>,
                    })}
                </BodyLong>
            </GuidePanel>

            <Heading level="1" size="xlarge" spacing>
                {getSøknadstematekst(soknadstema, {
                    [Søknadstema.Uføre]: formatMessage('page.tittel.uføre'),
                    [Søknadstema.Alder]: formatMessage('page.tittel.alder'),
                })}
            </Heading>

            <section className={styles.section}>
                <Ingress spacing>{formatMessage('suppstønadInfo.ingress')}</Ingress>
                <BodyLong>
                    <Link target="_blank" href={merOmSuForUføreLink}>
                        {formatMessage('suppstønad.merOmSuForUføre')}
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
                    <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.flyktningsstatus')}</li>
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
                        //eslint-disable-next-line react/display-name
                        navLink: (tekst) => (
                            <Link target="_blank" href={suUførFlyktningLink}>
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

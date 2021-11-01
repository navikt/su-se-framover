import { BodyLong, GuidePanel, Heading, Ingress, Link } from '@navikt/ds-react';
import React from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useI18n } from '~lib/i18n';

import messages from './infoside-nb';
import styles from './infoside.module.less';

const Infoside = (props: { nesteUrl: string }) => {
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

            <Heading level="1" size="2xlarge" spacing>
                {formatMessage('page.tittel')}
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
                <BodyLong spacing>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.personinfo')}</li>
                        <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.arbeidsforhold')}</li>
                        <li className={styles.listItem}>{formatMessage('henterInnInfo.viHenter.flyktningsstatus')}</li>
                    </ul>
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

            <LinkAsButton variant="primary" href={props.nesteUrl} className={styles.knapp}>
                {formatMessage('knapp.neste')}
            </LinkAsButton>
        </div>
    );
};

export default Infoside;

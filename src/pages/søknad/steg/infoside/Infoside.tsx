import { BodyLong, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';

import messages from './infoside-nb';
import styles from './infoside.module.less';

const Infoside = (props: { nesteUrl: string }) => {
    const suUførFlyktningLink = 'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-ufor-flyktning';
    const merOmSuForUføreLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-ufore-flyktninger';
    const personvernLink = 'https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten';

    return (
        <IntlProvider locale="nb" messages={messages}>
            <div className={styles.pageContainer}>
                <Heading level="1" size="2xlarge" spacing>
                    <FormattedMessage id="page.tittel" />
                </Heading>

                <div>
                    <BodyLong>
                        <FormattedMessage id="suppstønadInfo.kanFåSupp" />
                    </BodyLong>
                    <BodyLong spacing>
                        <FormattedMessage id="suppstønadInfo.sikreEnInntekt" />
                    </BodyLong>
                    <BodyLong>
                        <FormattedMessage id="suppstønadInfo.inntekt.medEPS" />
                    </BodyLong>
                    <BodyLong spacing>
                        <FormattedMessage id="suppstønadInfo.inntekt.alene" />
                    </BodyLong>
                    <BodyLong spacing>
                        <Link target="_blank" href={merOmSuForUføreLink}>
                            <FormattedMessage id="suppstønad.merOmSuForUføre" />
                        </Link>
                    </BodyLong>
                </div>

                <section className={styles.section}>
                    <Heading level="2" size="small" spacing>
                        <FormattedMessage id="henterInnInfo.ingress" />
                    </Heading>
                    <BodyLong>
                        <FormattedMessage id="henterInnInfo.viHenterInfo" />
                    </BodyLong>
                    <BodyLong spacing>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <FormattedMessage id="henterInnInfo.viHenter.personinfo" />
                            </li>
                            <li className={styles.listItem}>
                                <FormattedMessage id="henterInnInfo.viHenter.arbeidsforhold" />
                            </li>
                            <li className={styles.listItem}>
                                <FormattedMessage id="henterInnInfo.viHenter.flyktningsstatus" />
                            </li>
                        </ul>
                    </BodyLong>
                    <BodyLong spacing>
                        <FormattedMessage id="henterInnInfo.brukerTidligereOpplysninger" />
                    </BodyLong>

                    <BodyLong spacing>
                        <Link target="_blank" href={personvernLink}>
                            <FormattedMessage id="henterInnInfo.personvernLinkTekst" />
                        </Link>
                    </BodyLong>
                </section>

                <section className={styles.section}>
                    <Heading level="2" size="small" spacing>
                        <FormattedMessage id="viktigÅVite.ingress" />
                    </Heading>
                    <BodyLong spacing>
                        <FormattedMessage id="viktigÅVite.blirIkkeLagret" />
                    </BodyLong>
                    <BodyLong spacing>
                        <FormattedMessage
                            id="viktigÅVite.manglerDuDokumentasjon"
                            values={{
                                //eslint-disable-next-line react/display-name
                                navLink: (tekst: string) => (
                                    <Link target="_blank" href={suUførFlyktningLink}>
                                        {tekst}
                                    </Link>
                                ),
                            }}
                        />
                    </BodyLong>
                </section>

                <div className={styles.knappContainer}>
                    <LinkAsButton variant="primary" href={props.nesteUrl}>
                        <FormattedMessage id="knapp.neste" />
                    </LinkAsButton>
                </div>
            </div>
        </IntlProvider>
    );
};

export default Infoside;

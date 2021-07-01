import Lenke from 'nav-frontend-lenker';
import { Sidetittel, Ingress } from 'nav-frontend-typografi';
import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

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
                <Sidetittel className={styles.tittel}>
                    <FormattedMessage id="page.tittel" />
                </Sidetittel>

                <div>
                    <p>
                        <FormattedMessage id="suppstønadInfo.kanFåSupp" />
                    </p>
                    <p>
                        <FormattedMessage id="suppstønadInfo.sikreEnInntekt" />
                    </p>
                    <div className={styles.paragraphSpacing}>
                        <p>
                            <FormattedMessage id="suppstønadInfo.inntekt.medEPS" />
                        </p>
                        <p>
                            <FormattedMessage id="suppstønadInfo.inntekt.alene" />
                        </p>
                    </div>
                    <div className={styles.paragraphSpacing}>
                        <Lenke target="_blank" href={merOmSuForUføreLink}>
                            <FormattedMessage id="suppstønad.merOmSuForUføre" />
                        </Lenke>
                    </div>
                </div>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="henterInnInfo.ingress" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="henterInnInfo.viHenterInfo" />
                    </p>
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
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="henterInnInfo.brukerTidligereOpplysninger" />
                    </p>

                    <div className={styles.paragraphSpacing}>
                        <Lenke target="_blank" href={personvernLink}>
                            <FormattedMessage id="henterInnInfo.personvernLinkTekst" />
                        </Lenke>
                    </div>
                </section>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="viktigÅVite.ingress" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="viktigÅVite.blirIkkeLagret" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage
                            id="viktigÅVite.manglerDuDokumentasjon"
                            values={{
                                //eslint-disable-next-line react/display-name
                                navLink: (tekst: string) => (
                                    <Lenke target="_blank" href={suUførFlyktningLink}>
                                        {tekst}
                                    </Lenke>
                                ),
                            }}
                        />
                    </p>
                </section>

                <div className={styles.knappContainer}>
                    <Link className="knapp knapp--hoved" to={props.nesteUrl}>
                        <FormattedMessage id="knapp.neste" />
                    </Link>
                </div>
            </div>
        </IntlProvider>
    );
};

export default Infoside;

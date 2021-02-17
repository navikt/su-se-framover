import Lenke from 'nav-frontend-lenker';
import { Sidetittel, Ingress, Element } from 'nav-frontend-typografi';
import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import messages from './infoside-nb';
import styles from './infoside.module.less';

const Infoside = (props: { nesteUrl: string }) => {
    const merOmSuForUføreLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-ufore-flyktninger';

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
                        <FormattedMessage id="suppstønadInfo.garantertSamletInntekt" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="suppstønadInfo.inntekt" />
                    </p>
                    <div className={styles.paragraphSpacing}>
                        <Lenke target="_blank" href={merOmSuForUføreLink}>
                            <FormattedMessage id="suppstønad.merOmSuForUføre" />
                        </Lenke>
                    </div>
                </div>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="riktigeOpplysninger.girOssRiktigeOpplysninger" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="riktigeOpplysninger.behandleDinSøknad" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="riktigeOpplysninger.hvisDuFårSU" />
                    </p>
                </section>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="sendeInnDokumentasjon.måSendeInnDok" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.dokGjelder" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed" />
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt1" />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt2" />
                        </li>
                    </ul>

                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.kanskjeLeggesVed" />
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.kanskjeLeggesVed.punkt1" />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.kanskjeLeggesVed.punkt2" />
                        </li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="henterInnInfo.viHenterInnInfo" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="henterInnInfo.henterInfoForAvgjøreRettTilSøknad" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="henterInnInfo.viHenter" />
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <FormattedMessage
                                id="henterInnInfo.viHenter.personinfo"
                                values={{
                                    //eslint-disable-next-line react/display-name
                                    b: (text: string) => <Element className={styles.elementContainer}>{text}</Element>,
                                }}
                            />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage
                                id="henterInnInfo.viHenter.arbeidsforhold"
                                values={{
                                    //eslint-disable-next-line react/display-name
                                    b: (text: string) => <Element className={styles.elementContainer}>{text}</Element>,
                                }}
                            />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage
                                id="henterInnInfo.viHenter.flyktningsstatus"
                                values={{
                                    //eslint-disable-next-line react/display-name
                                    b: (text: string) => <Element className={styles.elementContainer}>{text}</Element>,
                                }}
                            />
                        </li>
                    </ul>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="henterInnInfo.brukerTidligereOpplysninger" />
                    </p>
                </section>

                <section className={styles.section}>
                    <Ingress>
                        <FormattedMessage id="slikSøkerDu" />
                    </Ingress>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="slikSøkerDu.blirIkkeLagret" />
                    </p>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="slikSøkerDu.manglerDuDokumentasjon" />
                    </p>
                </section>

                <div className={styles.knappContainer}>
                    <Link className="knapp knapp--hoved" to={props.nesteUrl}>
                        <FormattedMessage id="knapp.startUtfylling" />
                    </Link>
                </div>
            </div>
        </IntlProvider>
    );
};

export default Infoside;

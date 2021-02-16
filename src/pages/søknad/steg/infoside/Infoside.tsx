import Lenke from 'nav-frontend-lenker';
import { Sidetittel, Ingress, Element } from 'nav-frontend-typografi';
import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { useI18n } from '~lib/hooks';

import messages from './infoside-nb';
import styles from './infoside.module.less';

const Infoside = (props: { nesteUrl: string }) => {
    const intl = useI18n({ messages });
    const merOmSuForUføreLink =
        'https://www.nav.no/no/person/pensjon/andre-pensjonsordninger/supplerende-stonad-for-ufore-flyktninger';

    return (
        <IntlProvider locale="nb" messages={messages}>
            <div className={styles.pageContainer}>
                <Sidetittel className={styles.tittel}>{intl.formatMessage({ id: 'page.tittel' })}</Sidetittel>

                <div>
                    <p>{intl.formatMessage({ id: 'suppstønadInfo.kanFåSupp' })}</p>
                    <p>{intl.formatMessage({ id: 'suppstønadInfo.garantertSamletInntekt' })}</p>
                    <p className={styles.paragraphSpacing}>{intl.formatMessage({ id: 'suppstønadInfo.inntekt' })}</p>
                    <Lenke target="_blank" href={merOmSuForUføreLink}>
                        <p className={styles.paragraphSpacing}>
                            {intl.formatMessage({ id: 'suppstønad.merOmSuForUføre' })}
                        </p>
                    </Lenke>
                </div>

                <section className={styles.section}>
                    <Ingress>{intl.formatMessage({ id: 'riktigeOpplysninger.girOssRiktigeOpplysninger' })}</Ingress>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'riktigeOpplysninger.behandleDinSøknad' })}
                    </p>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'riktigeOpplysninger.hvisDuFårSU' })}
                    </p>
                </section>

                <section className={styles.section}>
                    <Ingress>{intl.formatMessage({ id: 'sendeInnDokumentasjon.måSendeInnDok' })}</Ingress>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'sendeInnDokumentasjon.dokGjelder' })}
                    </p>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'sendeInnDokumentasjon.måLeggesVed' })}
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            {intl.formatMessage({ id: 'sendeInnDokumentasjon.måLeggesVed.punkt1' })}
                        </li>
                        <li className={styles.listItem}>
                            {intl.formatMessage({ id: 'sendeInnDokumentasjon.måLeggesVed.punkt2' })}
                        </li>
                    </ul>

                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'sendeInnDokumentasjon.kanskjeLeggesVed' })}
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            {intl.formatMessage({ id: 'sendeInnDokumentasjon.kanskjeLeggesVed.punkt1' })}
                        </li>
                        <li className={styles.listItem}>
                            {intl.formatMessage({ id: 'sendeInnDokumentasjon.kanskjeLeggesVed.punkt2' })}
                        </li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <Ingress>{intl.formatMessage({ id: 'henterInnInfo.viHenterInnInfo' })}</Ingress>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'henterInnInfo.henterInfoForAvgjøreRettTilSøknad' })}
                    </p>
                    <p className={styles.paragraphSpacing}>{intl.formatMessage({ id: 'henterInnInfo.viHenter' })}</p>
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
                        {intl.formatMessage({ id: 'henterInnInfo.brukerTidligereOpplysninger' })}
                    </p>
                </section>

                <section className={styles.section}>
                    <Ingress>{intl.formatMessage({ id: 'slikSøkerDu' })}</Ingress>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'slikSøkerDu.blirIkkeLagret' })}
                    </p>
                    <p className={styles.paragraphSpacing}>
                        {intl.formatMessage({ id: 'slikSøkerDu.manglerDuDokumentasjon' })}
                    </p>
                </section>

                <div className={styles.knappContainer}>
                    <Link className="knapp knapp--hoved" to={props.nesteUrl}>
                        {intl.formatMessage({ id: 'knapp.startUtfylling' })}
                    </Link>
                </div>
            </div>
        </IntlProvider>
    );
};

export default Infoside;

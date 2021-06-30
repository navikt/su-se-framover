import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import React from 'react';
import { RawIntlProvider, FormattedMessage, FormattedDate } from 'react-intl';

import stegMessages from '~/pages/søknad/nb';
import boOgOppholdMessages from '~/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import epsFormueMessages from '~/pages/søknad/steg/ektefelle/ektefellesformue-nb';
import epsInntektMessages from '~/pages/søknad/steg/ektefelle/inntekt-nb';
import flyktningstatusMessages from '~/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import formueMessages from '~/pages/søknad/steg/formue/dinformue-nb';
import inntektMessages from '~/pages/søknad/steg/inntekt/inntekt-nb';
import uførevedtakMessages from '~/pages/søknad/steg/uførevedtak/uførevedtak-nb';
import utenlandsoppholdMessages from '~/pages/søknad/steg/utenlandsopphold/utenlandsopphold-nb';
import { Person } from '~api/personApi';
import { SøknadState } from '~features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { formatAdresse } from '~lib/formatUtils';
import { useI18n } from '~lib/hooks';
import { Søknadsteg } from '~pages/søknad/types';

import sharedStyles from '../../../steg-shared.module.less';
import { EndreSvar } from '../components/EndreSvar';
import { FormueOppsummering } from '../components/FormueOppsummering';
import InntektsOppsummering from '../components/InntektsOppsummering';
import { Oppsummeringsfelt } from '../components/Oppsummeringsfelt';

import { ingenAdresseGrunnTekst } from './OppsummeringUtils';
import oppsummeringMessages from './søknadsoppsummering-nb';
import styles from './søknadsoppsummering.module.less';

const Søknadoppsummering = ({ søknad, søker }: { søknad: SøknadState; søker: Person }) => {
    const intl = useI18n({
        messages: {
            ...stegMessages,
            ...uførevedtakMessages,
            ...flyktningstatusMessages,
            ...boOgOppholdMessages,
            ...utenlandsoppholdMessages,
            ...oppsummeringMessages,
        },
    });

    return (
        <RawIntlProvider value={intl}>
            <div>
                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.uforevedtak' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="uførevedtak.label" />}
                        verdi={søknad.harUførevedtak ? 'Ja' : søknad.harUførevedtak === false ? 'Nei' : 'Ubesvart'}
                    />
                    <EndreSvar path={Søknadsteg.Uførevedtak} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.flyktningstatus' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="flyktning.label" />}
                        verdi={
                            søknad.flyktningstatus.erFlyktning
                                ? 'Ja'
                                : søknad.flyktningstatus.erFlyktning === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="norsk.statsborger.label" />}
                        verdi={
                            søknad.flyktningstatus.erNorskStatsborger
                                ? 'Ja'
                                : søknad.flyktningstatus.erNorskStatsborger === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.flyktningstatus.erNorskStatsborger === false && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="oppholdstillatelse.label" />}
                            verdi={
                                søknad.flyktningstatus.harOppholdstillatelse
                                    ? 'Ja'
                                    : søknad.flyktningstatus.harOppholdstillatelse === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.flyktningstatus.harOppholdstillatelse && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="oppholdstillatelse.type" />}
                            verdi={
                                søknad.flyktningstatus.typeOppholdstillatelse === 'permanent'
                                    ? 'Permanent'
                                    : søknad.flyktningstatus.typeOppholdstillatelse === 'midlertidig'
                                    ? 'Midlertidig'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    <Oppsummeringsfelt
                        label={<FormattedMessage id="statsborger.andre.land.label" />}
                        verdi={
                            søknad.flyktningstatus.statsborgerskapAndreLand
                                ? 'Ja'
                                : søknad.flyktningstatus.statsborgerskapAndreLand === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.flyktningstatus.statsborgerskapAndreLand && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="statsborger.andre.land.fritekst" />}
                            verdi={søknad.flyktningstatus.statsborgerskapAndreLandFritekst}
                        />
                    )}
                    <EndreSvar path={Søknadsteg.FlyktningstatusOppholdstillatelse} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.boOgOppholdINorge' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="borOgOppholderINorge.label" />}
                        verdi={
                            søknad.boOgOpphold.borOgOppholderSegINorge
                                ? 'Ja'
                                : søknad.boOgOpphold.borOgOppholderSegINorge === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="delerBolig.delerBoligMedPersonOver18" />}
                        verdi={
                            søknad.boOgOpphold.delerBoligMedPersonOver18
                                ? 'Ja'
                                : søknad.boOgOpphold.delerBoligMedPersonOver18 === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.boOgOpphold.delerBoligMedPersonOver18 && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="delerBolig.delerMedHvem" />}
                            verdi={
                                søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                                    ? intl.formatMessage({
                                          id: 'delerBolig.eps',
                                      })
                                    : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
                                    ? intl.formatMessage({
                                          id: 'delerBolig.voksneBarn',
                                      })
                                    : intl.formatMessage({
                                          id: 'delerBolig.andreVoksne',
                                      })
                            }
                        />
                    )}
                    {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER &&
                        søknad.boOgOpphold.ektefellePartnerSamboer && (
                            <>
                                <Oppsummeringsfelt
                                    label={intl.formatMessage({
                                        id: 'input.ektefelleEllerSamboerFnr.label',
                                    })}
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer.fnr}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="delerBolig.epsUførFlyktning" />}
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning ? 'Ja' : 'Nei'}
                                />
                            </>
                        )}

                    <Oppsummeringsfelt
                        label={<FormattedMessage id="innlagtPåInstitusjon.label" />}
                        verdi={
                            søknad.boOgOpphold.innlagtPåinstitusjon
                                ? 'Ja'
                                : søknad.boOgOpphold.innlagtPåinstitusjon === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.boOgOpphold.innlagtPåinstitusjon && (
                        <>
                            <Oppsummeringsfelt
                                label={<FormattedMessage id="innlagtPåInstitusjon.datoForInnleggelse" />}
                                verdi={
                                    søknad.boOgOpphold.datoForInnleggelse && (
                                        <FormattedDate value={søknad.boOgOpphold.datoForInnleggelse} />
                                    )
                                }
                            />

                            {søknad.boOgOpphold.datoForUtskrivelse ? (
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="innlagtPåInstitusjon.datoForUtskrivelse" />}
                                    verdi={
                                        søknad.boOgOpphold.datoForInnleggelse && (
                                            <FormattedDate value={søknad.boOgOpphold.datoForUtskrivelse} />
                                        )
                                    }
                                />
                            ) : (
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="innlagtPåInstitusjon.fortsattInnlagt" />}
                                    verdi={søknad.boOgOpphold.fortsattInnlagt ? 'Ja' : 'Nei'}
                                />
                            )}
                        </>
                    )}

                    <Oppsummeringsfelt
                        label={intl.formatMessage({ id: 'boOgOpphold.adresse' })}
                        verdi={
                            søknad.boOgOpphold.borPåAdresse
                                ? formatAdresse(søknad.boOgOpphold.borPåAdresse)
                                : ingenAdresseGrunnTekst(søknad.boOgOpphold.ingenAdresseGrunn, intl) ?? 'Ubesvart'
                        }
                    />

                    <EndreSvar path={Søknadsteg.BoOgOppholdINorge} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.formue' })}
                >
                    <FormueOppsummering formue={søknad.formue} messages={formueMessages} />
                    <EndreSvar path={Søknadsteg.DinFormue} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.inntekt' })}
                >
                    <InntektsOppsummering inntekt={søknad.inntekt} messages={inntektMessages} />
                    <EndreSvar path={Søknadsteg.DinInntekt} søker={søker} />
                </Ekspanderbartpanel>

                {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                    <>
                        <Ekspanderbartpanel
                            className={styles.ekspanderbarOppsumeringSeksjon}
                            tittel={intl.formatMessage({ id: 'steg.ektefellesFormue' })}
                        >
                            <FormueOppsummering formue={søknad.ektefelle.formue} messages={epsFormueMessages} />
                            <EndreSvar path={Søknadsteg.EktefellesFormue} søker={søker} />
                        </Ekspanderbartpanel>
                        <Ekspanderbartpanel
                            className={styles.ekspanderbarOppsumeringSeksjon}
                            tittel={intl.formatMessage({ id: 'steg.ektefellesInntekt' })}
                        >
                            <InntektsOppsummering inntekt={søknad.ektefelle.inntekt} messages={epsInntektMessages} />
                            <EndreSvar path={Søknadsteg.EktefellesInntekt} søker={søker} />
                        </Ekspanderbartpanel>
                    </>
                )}

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.utenlandsopphold' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="harReistSiste90.label" />}
                        verdi={
                            søknad.utenlandsopphold.harReistTilUtlandetSiste90dager
                                ? 'Ja'
                                : søknad.utenlandsopphold.harReistTilUtlandetSiste90dager === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.utenlandsopphold.harReistTilUtlandetSiste90dager &&
                        søknad.utenlandsopphold.harReistDatoer.map((item, index) => (
                            <div className={sharedStyles.inputFelterDiv} key={index}>
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="utreisedato.label" />}
                                    verdi={item.utreisedato ? <FormattedDate value={item.utreisedato} /> : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="innreisedato.label" />}
                                    verdi={item.innreisedato ? <FormattedDate value={item.innreisedato} /> : 'Ubesvart'}
                                />
                            </div>
                        ))}

                    <Oppsummeringsfelt
                        label={<FormattedMessage id="skalReiseNeste12.label" />}
                        verdi={
                            søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
                                ? 'Ja'
                                : søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder &&
                        søknad.utenlandsopphold.skalReiseDatoer.map((item, index) => (
                            <div className={sharedStyles.inputFelterDiv} key={index}>
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="utreisedato.label" />}
                                    verdi={item.utreisedato ? <FormattedDate value={item.utreisedato} /> : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="innreisedato.label" />}
                                    verdi={item.innreisedato ? <FormattedDate value={item.innreisedato} /> : 'Ubesvart'}
                                />
                            </div>
                        ))}
                    <EndreSvar path={Søknadsteg.ReiseTilUtlandet} søker={søker} />
                </Ekspanderbartpanel>
            </div>
        </RawIntlProvider>
    );
};

export default Søknadoppsummering;

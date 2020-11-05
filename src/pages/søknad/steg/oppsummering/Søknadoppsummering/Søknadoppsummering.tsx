import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import React from 'react';
import { RawIntlProvider, FormattedMessage } from 'react-intl';

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
import { useI18n } from '~lib/hooks';
import { Søknadsteg } from '~pages/søknad/types';

import sharedStyles from '../../../steg-shared.module.less';
import { EndreSvar } from '../components/EndreSvar';
import { FormueOppsummering } from '../components/FormueOppsummering';
import InntektsOppsummering from '../components/InntektsOppsummering';
import { Oppsummeringsfelt } from '../components/Oppsummeringsfelt';

import styles from './oppsummering.module.less';

const reverseStr = (str: string) => {
    return str.split('-').reverse().join('-');
};

const Søknadoppsummering = ({ søknad, søker }: { søknad: SøknadState; søker: Person }) => {
    const intl = useI18n({
        messages: {
            ...stegMessages,
            ...uførevedtakMessages,
            ...flyktningstatusMessages,
            ...boOgOppholdMessages,
            ...utenlandsoppholdMessages,
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
                        label={<FormattedMessage id="input.uførevedtak.label" />}
                        verdi={søknad.harUførevedtak ? 'Ja' : søknad.harUførevedtak === false ? 'Nei' : 'Ubesvart'}
                    />
                    <EndreSvar path={Søknadsteg.Uførevedtak} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'steg.flyktningstatus' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.flyktning.label" />}
                        verdi={
                            søknad.flyktningstatus.erFlyktning
                                ? 'Ja'
                                : søknad.flyktningstatus.erFlyktning === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.norsk.statsborger.label" />}
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
                            label={<FormattedMessage id="input.oppholdstillatelse.label" />}
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
                            label={<FormattedMessage id="input.hvilken.oppholdstillatelse.label" />}
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
                        label={<FormattedMessage id="input.statsborger.andre.land.label" />}
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
                            label={<FormattedMessage id="input.statsborger.andre.land.fritekst.label" />}
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
                        label={<FormattedMessage id="input.opphold-i-norge.label" />}
                        verdi={
                            søknad.boOgOpphold.borOgOppholderSegINorge
                                ? 'Ja'
                                : søknad.boOgOpphold.borOgOppholderSegINorge === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.delerBoligMedPersonOver18.label" />}
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
                            label={<FormattedMessage id="input.delerBoligMed.label" />}
                            verdi={
                                søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                                    ? intl.formatMessage({
                                          id: 'input.delerBoligMedEktefelleEllerSamboer.label',
                                      })
                                    : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
                                    ? intl.formatMessage({
                                          id: 'input.delerBoligMedAndreVoksne.label',
                                      })
                                    : intl.formatMessage({
                                          id: 'input.delerBoligMedBarnOver18.label',
                                      })
                            }
                        />
                    )}
                    {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER &&
                        søknad.boOgOpphold.ektefellePartnerSamboer && (
                            <>
                                <Oppsummeringsfelt
                                    label={
                                        søknad.boOgOpphold.ektefellePartnerSamboer?.fnr
                                            ? intl.formatMessage({
                                                  id: 'input.ektefelleEllerSamboerFnr.label',
                                              })
                                            : intl.formatMessage({
                                                  id: 'input.ektefelleEllerSamboerFødselsdato.label',
                                              })
                                    }
                                    verdi={
                                        søknad.boOgOpphold.ektefellePartnerSamboer.fnr ??
                                        søknad.boOgOpphold.ektefellePartnerSamboer.fødselsdato
                                    }
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.ektefelleEllerSamboerUførFlyktning.label" />}
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning ? 'Ja' : 'Nei'}
                                />
                            </>
                        )}

                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.innlagtPåInstitusjon.label" />}
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
                                label={<FormattedMessage id="input.datoForInnlegelse.label" />}
                                verdi={
                                    søknad.boOgOpphold.datoForInnlegelse &&
                                    reverseStr(søknad.boOgOpphold.datoForInnlegelse)
                                }
                            />

                            {søknad.boOgOpphold.datoForUtskrivelse ? (
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.datoForUtskrivelse.label" />}
                                    verdi={reverseStr(søknad.boOgOpphold.datoForUtskrivelse)}
                                />
                            ) : (
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.fortsattInnlagt.label" />}
                                    verdi={søknad.boOgOpphold.fortsattInnlagt ? 'Ja' : 'Nei'}
                                />
                            )}
                        </>
                    )}

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
                        label={<FormattedMessage id="input.harReistSiste90.label" />}
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
                                    label={<FormattedMessage id="input.utreisedato.label" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.innreisedato.label" />}
                                    verdi={item.innreisedato ? reverseStr(item.innreisedato) : 'Ubesvart'}
                                />
                            </div>
                        ))}

                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.skalReiseNeste12.label" />}
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
                                    label={<FormattedMessage id="input.utreisedato.label" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.innreisedato.label" />}
                                    verdi={item.innreisedato ? reverseStr(item.innreisedato) : 'Ubesvart'}
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

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import React from 'react';
import { RawIntlProvider, FormattedMessage } from 'react-intl';

import epsFormueMessages from '~/pages/søknad/steg/ektefelle/ektefellesformue-nb';
import formueMessages from '~/pages/søknad/steg/formue/dinformue-nb';
import { Person } from '~api/personApi';
import { SøknadState } from '~features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { Søknadsteg } from '~pages/søknad/types';

import sharedStyles from '../../../steg-shared.module.less';
import InntektsOppsummering from '../components/InntektsOppsummering';

import { EndreSvar } from './EndreSvar';
import { FormueOppsummering } from './FormueOppsummering';
import messages from './oppsummering-nb';
import styles from './oppsummering.module.less';
import { Oppsummeringsfelt } from './Oppsummeringsfelt';

const reverseStr = (str: string) => {
    return str.split('-').reverse().join('-');
};

const Søknadoppsummering = ({ søknad, søker }: { søknad: SøknadState; søker: Person }) => {
    const intl = useI18n({ messages });

    return (
        <RawIntlProvider value={intl}>
            <div>
                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.uførevedtak' })}
                >
                    <Oppsummeringsfelt
                        label={<FormattedMessage id="input.uførevedtak.label" />}
                        verdi={søknad.harUførevedtak ? 'Ja' : søknad.harUførevedtak === false ? 'Nei' : 'Ubesvart'}
                    />
                    <EndreSvar path={Søknadsteg.Uførevedtak} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.flyktningstatus' })}
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

                    {søknad.flyktningstatus.typeOppholdstillatelse === 'midlertidig' && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="input.midlertidig.oppholdstillatelse.opphører.label" />}
                            verdi={
                                søknad.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder
                                    ? 'Ja'
                                    : søknad.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder && (
                        <Oppsummeringsfelt
                            label={<FormattedMessage id="input.oppholdtillatelse.forlengelse.label" />}
                            verdi={
                                søknad.flyktningstatus.oppholdstillatelseForlengelse
                                    ? 'Ja'
                                    : søknad.flyktningstatus.oppholdstillatelseForlengelse === false
                                    ? 'Nei'
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
                    tittel={intl.formatMessage({ id: 'panel.tittel.boOgOpphold' })}
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
                                    ? 'Ektemake eller samboer'
                                    : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
                                    ? 'Voksne barn'
                                    : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.ANNEN_VOKSEN
                            }
                        />
                    )}
                    {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER &&
                        søknad.boOgOpphold.ektefellePartnerSamboer && (
                            <>
                                <Oppsummeringsfelt
                                    label={intl.formatMessage({ id: 'input.ektemakeEllerSamboerFnr.label' })}
                                    verdi={
                                        søknad.boOgOpphold.ektefellePartnerSamboer.type === 'MedFnr'
                                            ? søknad.boOgOpphold.ektefellePartnerSamboer.fnr
                                            : søknad.boOgOpphold.ektefellePartnerSamboer.fødselsdato
                                    }
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.ektemakeEllerSamboerUførFlyktning.label" />}
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning ? 'Ja' : 'Nei'}
                                />
                            </>
                        )}
                    <EndreSvar path={Søknadsteg.BoOgOppholdINorge} søker={søker} />
                </Ekspanderbartpanel>

                <FormueOppsummering
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinFormue' })}
                    formue={søknad.formue}
                    søker={søker}
                    messages={formueMessages}
                    søknadsteg={Søknadsteg.DinFormue}
                />

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinInntekt' })}
                >
                    <InntektsOppsummering inntekt={søknad.inntekt} intl={intl} />
                    <EndreSvar path={Søknadsteg.DinInntekt} søker={søker} />
                </Ekspanderbartpanel>

                {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                    <>
                        <FormueOppsummering
                            tittel={intl.formatMessage({ id: 'panel.tittel.ektefellesFormue' })}
                            formue={søknad.ektefelle.formue}
                            søker={søker}
                            messages={epsFormueMessages}
                            søknadsteg={Søknadsteg.EktefellesFormue}
                        />
                        <Ekspanderbartpanel
                            className={styles.ekspanderbarOppsumeringSeksjon}
                            tittel={intl.formatMessage({ id: 'panel.tittel.ektefelle.inntekt' })}
                        >
                            <InntektsOppsummering inntekt={søknad.ektefelle.inntekt} intl={intl} />
                            <EndreSvar path={Søknadsteg.DinInntekt} søker={søker} />
                        </Ekspanderbartpanel>
                    </>
                )}

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.reiseTilUtlandet' })}
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
                                    label={<FormattedMessage id="input.utreisedato" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.innreisedato" />}
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
                                    label={<FormattedMessage id="input.utreisedato" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <Oppsummeringsfelt
                                    label={<FormattedMessage id="input.innreisedato" />}
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

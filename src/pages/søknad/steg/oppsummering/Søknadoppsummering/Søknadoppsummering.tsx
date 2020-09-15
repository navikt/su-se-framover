import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';
import { RawIntlProvider, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Person } from '~api/personApi';
import { PencilIcon } from '~assets/Icons';
import { SøknadState } from '~features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { trackEvent, søknadOppsummeringEndreSvarKlikk } from '~lib/tracking/trackingEvents';
import { Søknadsteg } from '~pages/søknad/types';

import sharedStyles from '../../../steg-shared.module.less';

import messages from './oppsummering-nb';
import styles from './oppsummering.module.less';

const OppsummeringsFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const OppsummeringsFeltAvKjøretøy = (props: {
    labelFirstEl: React.ReactNode;
    labelScndEl: React.ReactNode;
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
}) => {
    return (
        <div>
            {props.arr.map((el, idx) => {
                return (
                    <div className={styles.oppsummeringsfeltKjøretøyContainer} key={idx}>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelScndEl}</Element>
                            <Normaltekst>{el.kjøretøyDeEier}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelFirstEl}</Element>
                            <Normaltekst>{el.verdiPåKjøretøy}</Normaltekst>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const OppsummeringsFeltAvTrygdeytelser = (props: {
    labelFirstEl: React.ReactNode;
    labelScndEl: React.ReactNode;
    labelThirdEl: React.ReactNode;
    arr: Array<{ beløp: string; type: string; fraHvem: string }>;
}) => {
    return (
        <div>
            {props.arr.map((el, idx) => {
                return (
                    <div className={styles.oppsummeringsfeltTrygdeytelserContainer} key={idx}>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelFirstEl}</Element>
                            <Normaltekst>{el.beløp}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelScndEl}</Element>
                            <Normaltekst>{el.type}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelThirdEl}</Element>
                            <Normaltekst>{el.fraHvem}</Normaltekst>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const reverseStr = (str: string) => {
    return str.split('-').reverse().join('-');
};

const EndreSvar = (props: { path: Søknadsteg; søker: Person }) => {
    const intl = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknad.createURL({ step: props.path })}
            onClick={() => trackEvent(søknadOppsummeringEndreSvarKlikk({ ident: props.søker.aktorId }))}
        >
            <span className={styles.marginRight}>
                <PencilIcon width="15" height="15" />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
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
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.uførevedtak.label" />}
                        verdi={søknad.harUførevedtak ? 'Ja' : søknad.harUførevedtak === false ? 'Nei' : 'Ubesvart'}
                    />
                    <EndreSvar path={Søknadsteg.Uførevedtak} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.flyktningstatus' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.flyktning.label" />}
                        verdi={
                            søknad.flyktningstatus.erFlyktning
                                ? 'Ja'
                                : søknad.flyktningstatus.erFlyktning === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <OppsummeringsFelt
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
                        <OppsummeringsFelt
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
                        <OppsummeringsFelt
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
                        <OppsummeringsFelt
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
                        <OppsummeringsFelt
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

                    <OppsummeringsFelt
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
                        <OppsummeringsFelt
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
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.opphold-i-norge.label" />}
                        verdi={
                            søknad.boOgOpphold.borOgOppholderSegINorge
                                ? 'Ja'
                                : søknad.boOgOpphold.borOgOppholderSegINorge === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    <OppsummeringsFelt
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
                        <OppsummeringsFelt
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

                    {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.ektemakeEllerSamboerUnder67År.label" />}
                            verdi={
                                søknad.boOgOpphold.ektemakeEllerSamboerUnder67År
                                    ? 'Ja'
                                    : søknad.boOgOpphold.ektemakeEllerSamboerUnder67År === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.boOgOpphold.ektemakeEllerSamboerUnder67År && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.ektemakeEllerSamboerUførFlyktning.label" />}
                            verdi={
                                søknad.boOgOpphold.ektemakeEllerSamboerUførFlyktning
                                    ? 'Ja'
                                    : søknad.boOgOpphold.ektemakeEllerSamboerUførFlyktning === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}
                    <EndreSvar path={Søknadsteg.BoOgOppholdINorge} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinFormue' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.eierDuBolig.label" />}
                        verdi={søknad.formue.eierBolig ? 'Ja' : søknad.formue.eierBolig === false ? 'Nei' : 'Ubesvart'}
                    />

                    {søknad.formue.eierBolig === false && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.depositumskonto.label" />}
                            verdi={
                                søknad.formue.harDepositumskonto
                                    ? 'Ja'
                                    : søknad.formue.harDepositumskonto === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.formue.harDepositumskonto && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.depositumsBeløp.label" />}
                            verdi={søknad.formue.depositumsBeløp ? søknad.formue.depositumsBeløp : 'Ubesvart'}
                        />
                    )}
                    {søknad.formue.harDepositumskonto && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.kontonummer.label" />}
                            verdi={søknad.formue.kontonummer ? søknad.formue.kontonummer : 'Ubesvart'}
                        />
                    )}

                    {søknad.formue.eierBolig && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.borIBolig.label" />}
                            verdi={
                                søknad.formue.borIBolig ? 'Ja' : søknad.formue.borIBolig === false ? 'Nei' : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.formue.borIBolig === false && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.verdiPåBolig.label" />}
                            verdi={søknad.formue.verdiPåBolig ? søknad.formue.verdiPåBolig : 'Ubesvart'}
                        />
                    )}

                    {søknad.formue.borIBolig === false && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.boligBrukesTil.label" />}
                            verdi={søknad.formue.boligBrukesTil ? søknad.formue.boligBrukesTil : 'Ubesvart'}
                        />
                    )}

                    {søknad.formue.eierBolig && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.eierMerEnnEnBolig.label" />}
                            verdi={
                                søknad.formue.eierMerEnnEnBolig
                                    ? 'Ja'
                                    : søknad.formue.eierMerEnnEnBolig === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    {søknad.formue.eierMerEnnEnBolig && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.verdiPåEiendom.label" />}
                            verdi={søknad.formue.verdiPåEiendom ? søknad.formue.verdiPåEiendom : 'Ubesvart'}
                        />
                    )}

                    {søknad.formue.eierMerEnnEnBolig && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.eiendomBrukesTil.label" />}
                            verdi={søknad.formue.eiendomBrukesTil ? søknad.formue.eiendomBrukesTil : 'Ubesvart'}
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.eierKjøretøy.label" />}
                        verdi={
                            søknad.formue.eierKjøretøy
                                ? 'Ja'
                                : søknad.formue.eierKjøretøy === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.formue.eierKjøretøy && (
                        <OppsummeringsFeltAvKjøretøy
                            labelFirstEl={<FormattedMessage id="input.verdiPåKjøretøyTotal.label" />}
                            labelScndEl={<FormattedMessage id="input.kjøretøyDeEier.label" />}
                            arr={søknad.formue.kjøretøy}
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harInnskuddPåKonto.label" />}
                        verdi={
                            søknad.formue.harInnskuddPåKonto
                                ? 'Ja'
                                : søknad.formue.harInnskuddPåKonto === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.formue.harInnskuddPåKonto && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.innskuddsBeløp.label" />}
                            verdi={søknad.formue.innskuddsBeløp ? søknad.formue.innskuddsBeløp : 'Ubesvart'}
                        />
                    )}
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harVerdipapir.label" />}
                        verdi={
                            søknad.formue.harVerdipapir
                                ? 'Ja'
                                : søknad.formue.harVerdipapir === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.formue.verdipapirBeløp && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.verdipapirBeløp.label" />}
                            verdi={søknad.formue.verdipapirBeløp ? søknad.formue.verdipapirBeløp : 'Ubesvart'}
                        />
                    )}
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.skylderNoenMegPenger.label" />}
                        verdi={
                            søknad.formue.skylderNoenMegPenger
                                ? 'Ja'
                                : søknad.formue.skylderNoenMegPenger === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.formue.skylderNoenMegPenger && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.skylderNoenMegPengerBeløp.label" />}
                            verdi={
                                søknad.formue.skylderNoenMegPengerBeløp
                                    ? søknad.formue.skylderNoenMegPengerBeløp
                                    : 'Ubesvart'
                            }
                        />
                    )}
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harKontanterOver1000.label" />}
                        verdi={
                            søknad.formue.harKontanterOver1000
                                ? 'Ja'
                                : søknad.formue.harKontanterOver1000 === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.formue.harKontanterOver1000 && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.kontanterBeløp.label" />}
                            verdi={søknad.formue.kontanterBeløp ? søknad.formue.kontanterBeløp : 'Ubesvart'}
                        />
                    )}
                    <EndreSvar path={Søknadsteg.DinFormue} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinInntekt' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harForventetInntekt.label" />}
                        verdi={
                            søknad.inntekt.harForventetInntekt
                                ? 'Ja'
                                : søknad.inntekt.harForventetInntekt === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.inntekt.forventetInntekt && Number(søknad.inntekt.forventetInntekt) > 0 && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.forventetInntekt.label" />}
                            verdi={søknad.inntekt.forventetInntekt}
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.tjenerPengerIUtlandet.label" />}
                        verdi={
                            søknad.inntekt.tjenerPengerIUtlandet
                                ? 'Ja'
                                : søknad.inntekt.tjenerPengerIUtlandet === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.inntekt.tjenerPengerIUtlandet && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.tjenerPengerIUtlandetBeløp.label" />}
                            verdi={
                                søknad.inntekt.tjenerPengerIUtlandetBeløp
                                    ? søknad.inntekt.tjenerPengerIUtlandetBeløp
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.andreYtelserINAV.label" />}
                        verdi={
                            søknad.inntekt.andreYtelserINav
                                ? 'Ja'
                                : søknad.inntekt.andreYtelserINav === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.inntekt.andreYtelserINav && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.andreYtelserINavYtelse.label" />}
                            verdi={
                                søknad.inntekt.andreYtelserINavYtelse
                                    ? søknad.inntekt.andreYtelserINavYtelse
                                    : 'Ubesvart'
                            }
                        />
                    )}
                    {søknad.inntekt.andreYtelserINav && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.andreYtelserINavBeløp.label" />}
                            verdi={
                                søknad.inntekt.andreYtelserINavBeløp ? søknad.inntekt.andreYtelserINavBeløp : 'Ubesvart'
                            }
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandlet.label" />}
                        verdi={
                            søknad.inntekt.søktAndreYtelserIkkeBehandlet
                                ? 'Ja'
                                : søknad.inntekt.søktAndreYtelserIkkeBehandlet === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknad.inntekt.søktAndreYtelserIkkeBehandlet && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandletBegrunnelse.label" />}
                            verdi={
                                søknad.inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                                    ? søknad.inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                                    : 'Ubesvart'
                            }
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                        verdi={
                            søknad.inntekt.harMottattSosialstønad
                                ? 'Ja'
                                : søknad.inntekt.harMottattSosialstønad === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.inntekt.harMottattSosialstønad && (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.sosialStønadBeløp.label" />}
                            verdi={søknad.inntekt.sosialStønadBeløp ? søknad.inntekt.sosialStønadBeløp : 'Ubesvart'}
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.trygdeytelserIUtlandet.label" />}
                        verdi={
                            søknad.inntekt.harTrygdeytelserIUtlandet
                                ? 'Ja'
                                : søknad.inntekt.harTrygdeytelserIUtlandet === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.inntekt.harTrygdeytelserIUtlandet && (
                        <OppsummeringsFeltAvTrygdeytelser
                            arr={søknad.inntekt.trygdeytelserIUtlandet}
                            labelFirstEl="Brutto beløp i lokal valuta per år"
                            labelScndEl="Hvilken ytelser?"
                            labelThirdEl="Hvem gir disse ytelsene?"
                        />
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.mottarPensjon.label" />}
                        verdi={
                            søknad.inntekt.mottarPensjon
                                ? 'Ja'
                                : søknad.inntekt.mottarPensjon === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknad.inntekt.mottarPensjon &&
                        søknad.inntekt.pensjonsInntekt.map((item, index) => (
                            <div className={sharedStyles.inputFelterDiv} key={index}>
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.pensjonsOrdning.label" />}
                                    verdi={item.ordning}
                                />
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.pensjonsBeløp.label" />}
                                    verdi={item.beløp}
                                />
                            </div>
                        ))}
                    <EndreSvar path={Søknadsteg.DinInntekt} søker={søker} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.reiseTilUtlandet' })}
                >
                    <OppsummeringsFelt
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
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.utreisedato" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.innreisedato" />}
                                    verdi={item.innreisedato ? reverseStr(item.innreisedato) : 'Ubesvart'}
                                />
                            </div>
                        ))}

                    <OppsummeringsFelt
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
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.utreisedato" />}
                                    verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                />
                                <OppsummeringsFelt
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

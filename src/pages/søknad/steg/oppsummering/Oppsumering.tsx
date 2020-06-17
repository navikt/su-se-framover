import * as React from 'react';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { useAppSelector } from '~redux/Store';
import messages from './oppsumering-nb';
import styles from './oppsummering.module.less';
import sharedStyles from '../../steg-shared.module.less';
import { FormattedMessage, createIntlCache, createIntl, RawIntlProvider } from 'react-intl';
import { Bosituasjon } from '~features/søknad/types';

const cache = createIntlCache();
const intl = createIntl(
    {
        locale: 'nb-NO',
        messages
    },
    cache
);

const OppsummeringsFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const Oppsummering = () => {
    const søknadFraStore = useAppSelector(s => s.soknad);
    console.log(søknadFraStore);
    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.uførevedtak' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.uførevedtak.label" />}
                        verdi={
                            søknadFraStore.harUførevedtak
                                ? 'Ja'
                                : søknadFraStore.harUførevedtak === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.flyktningstatus' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.flyktning.label" />}
                        verdi={
                            søknadFraStore.flyktningstatus.erFlyktning
                                ? 'Ja'
                                : søknadFraStore.flyktningstatus.erFlyktning === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.oppholdstillatelse.label" />}
                        verdi={
                            søknadFraStore.flyktningstatus.harOppholdstillatelse
                                ? 'Ja'
                                : søknadFraStore.flyktningstatus.harOppholdstillatelse === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.boOgOpphold' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.opphold-i-norge.label" />}
                        verdi={
                            søknadFraStore.boOgOpphold.borOgOppholderSegINorge
                                ? 'Ja'
                                : søknadFraStore.boOgOpphold.borOgOppholderSegINorge === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.folkereg-adresse.label" />}
                        verdi={
                            søknadFraStore.boOgOpphold.borPåFolkeregistrertAdresse
                                ? 'Ja'
                                : søknadFraStore.boOgOpphold.borPåFolkeregistrertAdresse === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.bosituasjon.label" />}
                        verdi={
                            søknadFraStore.boOgOpphold.bosituasjon === Bosituasjon.BorAleneEllerMedBarnUnder18 ? (
                                <FormattedMessage id="input.bosituasjon.alene.label" />
                            ) : søknadFraStore.boOgOpphold.bosituasjon === Bosituasjon.BorMedNoenOver18 ? (
                                <FormattedMessage id="input.bosituasjon.medNoenOver18.label" />
                            ) : (
                                'Ubesvart'
                            )
                        }
                    />
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.delerBoligMedAndreVoksne.label" />}
                        verdi={
                            søknadFraStore.boOgOpphold.delerBoligMedAndreVoksne
                                ? 'Ja'
                                : søknadFraStore.boOgOpphold.delerBoligMedAndreVoksne === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinFormue' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harFormue.label" />}
                        verdi={
                            søknadFraStore.formue.harFormue
                                ? 'Ja'
                                : søknadFraStore.formue.harFormue === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknadFraStore.formue.harFormue ? (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.oppgiBeløp.label" />}
                            verdi={søknadFraStore.formue.beløpFormue ? søknadFraStore.formue.beløpFormue : 'Ubesvart'}
                        />
                    ) : (
                        ''
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.eierDuBolig.label" />}
                        verdi={
                            søknadFraStore.formue.eierBolig
                                ? 'Ja'
                                : søknadFraStore.formue.eierBolig === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.depositumskonto.label" />}
                        verdi={
                            søknadFraStore.formue.harDepositumskonto
                                ? 'Ja'
                                : søknadFraStore.formue.harDepositumskonto === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.dinInntekt' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harInntekt.label" />}
                        verdi={
                            søknadFraStore.inntekt.harInntekt
                                ? 'Ja'
                                : søknadFraStore.inntekt.harInntekt === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknadFraStore.inntekt.harInntekt ? (
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                            verdi={søknadFraStore.inntekt.harInntekt ? søknadFraStore.inntekt.inntektBeløp : 'Ubesvart'}
                        />
                    ) : (
                        ''
                    )}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.mottarPensjon.label" />}
                        verdi={
                            søknadFraStore.inntekt.mottarPensjon
                                ? 'Ja'
                                : søknadFraStore.inntekt.mottarPensjon === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />

                    {søknadFraStore.inntekt.mottarPensjon
                        ? søknadFraStore.inntekt.pensjonsInntekt.map((item, index) => (
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
                          ))
                        : ''}
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                        verdi={
                            søknadFraStore.inntekt.harMottattSosialstønad
                                ? 'Ja'
                                : søknadFraStore.inntekt.harMottattSosialstønad === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel
                    className={styles.ekspanderbarOppsumeringSeksjon}
                    tittel={intl.formatMessage({ id: 'panel.tittel.reiseTilUtlandet' })}
                >
                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.harReistSiste90.label" />}
                        verdi={
                            søknadFraStore.utenlandsopphold.harReistTilUtlandetSiste90dager
                                ? 'Ja'
                                : søknadFraStore.utenlandsopphold.harReistTilUtlandetSiste90dager === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknadFraStore.utenlandsopphold.harReistTilUtlandetSiste90dager
                        ? søknadFraStore.utenlandsopphold.harReistDatoer.map((item, index) => (
                              <div className={sharedStyles.inputFelterDiv} key={index}>
                                  <OppsummeringsFelt
                                      label={<FormattedMessage id="input.utreisedato" />}
                                      verdi={item.utreisedato ? item.utreisedato : 'Ubesvart'}
                                  />
                                  <OppsummeringsFelt
                                      label={<FormattedMessage id="input.innreisedato" />}
                                      verdi={item.innreisedato ? item.innreisedato : 'Ubesvart'}
                                  />
                              </div>
                          ))
                        : ''}

                    <OppsummeringsFelt
                        label={<FormattedMessage id="input.skalReiseNeste12.label" />}
                        verdi={
                            søknadFraStore.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
                                ? 'Ja'
                                : søknadFraStore.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder === false
                                ? 'Nei'
                                : 'Ubesvart'
                        }
                    />
                    {søknadFraStore.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
                        ? søknadFraStore.utenlandsopphold.skalReiseDatoer.map((item, index) => (
                              <div className={sharedStyles.inputFelterDiv} key={index}>
                                  <OppsummeringsFelt
                                      label={<FormattedMessage id="input.utreisedato" />}
                                      verdi={item.utreisedato ? item.utreisedato : 'Ubesvart'}
                                  />
                                  <OppsummeringsFelt
                                      label={<FormattedMessage id="input.innreisedato" />}
                                      verdi={item.innreisedato ? item.innreisedato : 'Ubesvart'}
                                  />
                              </div>
                          ))
                        : ''}
                </Ekspanderbartpanel>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            console.log('previous');
                        },
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                    next={{
                        onClick: () => {
                            console.log('next');
                        },
                        steg: Søknadsteg.Oppsummering
                    }}
                />
            </div>
        </RawIntlProvider>
    );
};

export default Oppsummering;

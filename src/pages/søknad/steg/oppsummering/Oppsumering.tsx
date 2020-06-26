import * as React from 'react';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import messages from './oppsumering-nb';
import styles from './oppsummering.module.less';
import sharedStyles from '../../steg-shared.module.less';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useI18n } from '~lib/hooks';
import * as innsendingSlice from '~features/søknad/innsending.slice';

const OppsummeringsFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const Oppsummering = (props: { forrigeUrl: string }) => {
    const history = useHistory();
    const søknadFraStore = useAppSelector((s) => s.soknad);
    const søkerFraStore = useAppSelector((s) => s.søker.søker);
    const dispatch = useAppDispatch();

    const intl = useI18n({ messages });

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (søkerFraStore) {
                            dispatch(innsendingSlice.sendSøknad({ søknad: søknadFraStore, søker: søkerFraStore }));
                        }
                    }}
                >
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
                            label={<FormattedMessage id="input.norsk.statsborger.label" />}
                            verdi={
                                søknadFraStore.flyktningstatus.erNorskStatsborger
                                    ? 'Ja'
                                    : søknadFraStore.flyktningstatus.erNorskStatsborger === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknadFraStore.flyktningstatus.erNorskStatsborger === false && (
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
                        )}

                        {søknadFraStore.flyktningstatus.harOppholdstillatelse && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.hvilken.oppholdstillatelse.label" />}
                                verdi={
                                    søknadFraStore.flyktningstatus.typeOppholdstillatelse === 'permanent'
                                        ? 'Permanent'
                                        : søknadFraStore.flyktningstatus.typeOppholdstillatelse === 'midlertidig'
                                        ? 'Midlertidig'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.flyktningstatus.typeOppholdstillatelse === 'midlertidig' && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.midlertidig.oppholdstillatelse.opphører.label" />}
                                verdi={
                                    søknadFraStore.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder
                                        ? 'Ja'
                                        : søknadFraStore.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.oppholdtillatelse.forlengelse.label" />}
                                verdi={
                                    søknadFraStore.flyktningstatus.oppholdstillatelseForlengelse
                                        ? 'Ja'
                                        : søknadFraStore.flyktningstatus.oppholdstillatelseForlengelse === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.statsborger.andre.land.label" />}
                            verdi={
                                søknadFraStore.flyktningstatus.statsborgerskapAndreLand
                                    ? 'Ja'
                                    : søknadFraStore.flyktningstatus.statsborgerskapAndreLand === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknadFraStore.flyktningstatus.statsborgerskapAndreLand && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.statsborger.andre.land.fritekst.label" />}
                                verdi={søknadFraStore.flyktningstatus.statsborgerskapAndreLandFritekst}
                            />
                        )}
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
                    </Ekspanderbartpanel>

                    <Ekspanderbartpanel
                        className={styles.ekspanderbarOppsumeringSeksjon}
                        tittel={intl.formatMessage({ id: 'panel.tittel.dinFormue' })}
                    >
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
                                søknadFraStore.inntekt.forventetInntekt === null
                                    ? 'Ubesvart'
                                    : Number(søknadFraStore.inntekt.forventetInntekt) > 0
                                    ? 'Ja'
                                    : 'Nei'
                            }
                        />

                        {søknadFraStore.inntekt.forventetInntekt &&
                            Number(søknadFraStore.inntekt.forventetInntekt) > 0 && (
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                                    verdi={søknadFraStore.inntekt.forventetInntekt}
                                />
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

                        {søknadFraStore.inntekt.mottarPensjon &&
                            søknadFraStore.inntekt.pensjonsInntekt.map((item, index) => (
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
                        {søknadFraStore.utenlandsopphold.harReistTilUtlandetSiste90dager &&
                            søknadFraStore.utenlandsopphold.harReistDatoer.map((item, index) => (
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
                            ))}

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
                        {søknadFraStore.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder &&
                            søknadFraStore.utenlandsopphold.skalReiseDatoer.map((item, index) => (
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
                            ))}
                    </Ekspanderbartpanel>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default Oppsummering;

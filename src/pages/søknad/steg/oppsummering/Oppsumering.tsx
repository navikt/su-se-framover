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

import * as RemoteData from '@devexperts/remote-data-ts';

const OppsummeringsFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const reverseStr = (str: string) => {
    return str.split('-').reverse().join('-');
};

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
                        if (RemoteData.isSuccess(søkerFraStore)) {
                            dispatch(
                                innsendingSlice.sendSøknad({
                                    søknad: søknadFraStore,
                                    søker: søkerFraStore.value,
                                })
                            );
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

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.delerBoligMedPersonOver18.label" />}
                            verdi={
                                søknadFraStore.boOgOpphold.delerBoligMedPersonOver18
                                    ? 'Ja'
                                    : søknadFraStore.boOgOpphold.delerBoligMedPersonOver18 === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknadFraStore.boOgOpphold.delerBoligMedPersonOver18 && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.delerBoligMed.label" />}
                                verdi={
                                    søknadFraStore.boOgOpphold.delerBoligMed === 'ektemake-eller-samboer'
                                        ? 'Ektemake eller samboer'
                                        : søknadFraStore.boOgOpphold.delerBoligMed === 'voksne-barn'
                                        ? 'Voksne barn'
                                        : søknadFraStore.boOgOpphold.delerBoligMed === 'andre'
                                }
                            />
                        )}

                        {søknadFraStore.boOgOpphold.delerBoligMed === 'ektemake-eller-samboer' && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.ektemakeEllerSamboerUnder67År.label" />}
                                verdi={
                                    søknadFraStore.boOgOpphold.ektemakeEllerSamboerUnder67År
                                        ? 'Ja'
                                        : søknadFraStore.boOgOpphold.ektemakeEllerSamboerUnder67År === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.boOgOpphold.ektemakeEllerSamboerUnder67År && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.ektemakeEllerSamboerUførFlyktning.label" />}
                                verdi={
                                    søknadFraStore.boOgOpphold.ektemakeEllerSamboerUførFlyktning
                                        ? 'Ja'
                                        : søknadFraStore.boOgOpphold.ektemakeEllerSamboerUførFlyktning === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}
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

                        {søknadFraStore.formue.eierBolig === false && (
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
                        )}

                        {søknadFraStore.formue.harDepositumskonto && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.depositumsBeløp.label" />}
                                verdi={
                                    søknadFraStore.formue.depositumsBeløp
                                        ? søknadFraStore.formue.depositumsBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        {søknadFraStore.formue.harDepositumskonto && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.kontonummer.label" />}
                                verdi={
                                    søknadFraStore.formue.kontonummer ? søknadFraStore.formue.kontonummer : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.eierBolig && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.borIBolig.label" />}
                                verdi={
                                    søknadFraStore.formue.borIBolig
                                        ? 'Ja'
                                        : søknadFraStore.formue.borIBolig === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.borIBolig === false && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.verdiPåBolig.label" />}
                                verdi={
                                    søknadFraStore.formue.verdiPåBolig ? søknadFraStore.formue.verdiPåBolig : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.borIBolig === false && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.boligBrukesTil.label" />}
                                verdi={
                                    søknadFraStore.formue.boligBrukesTil
                                        ? søknadFraStore.formue.boligBrukesTil
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.eierBolig && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.eierMerEnnEnBolig.label" />}
                                verdi={
                                    søknadFraStore.formue.eierMerEnnEnBolig
                                        ? 'Ja'
                                        : søknadFraStore.formue.eierMerEnnEnBolig === false
                                        ? 'Nei'
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.eierMerEnnEnBolig && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.verdiPåEiendom.label" />}
                                verdi={
                                    søknadFraStore.formue.verdiPåEiendom
                                        ? søknadFraStore.formue.verdiPåEiendom
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        {søknadFraStore.formue.eierMerEnnEnBolig && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.eiendomBrukesTil.label" />}
                                verdi={
                                    søknadFraStore.formue.eiendomBrukesTil
                                        ? søknadFraStore.formue.eiendomBrukesTil
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.eierKjøretøy.label" />}
                            verdi={
                                søknadFraStore.formue.eierKjøretøy
                                    ? 'Ja'
                                    : søknadFraStore.formue.eierKjøretøy === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.formue.eierKjøretøy && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.verdiPåKjøretøyTotal.label" />}
                                verdi={
                                    søknadFraStore.formue.verdiPåKjøretøy
                                        ? søknadFraStore.formue.verdiPåKjøretøy
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        {søknadFraStore.formue.eierKjøretøy && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.kjøretøyDeEier.label" />}
                                verdi={
                                    søknadFraStore.formue.kjøretøyDeEier
                                        ? søknadFraStore.formue.kjøretøyDeEier
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.harInnskuddPåKonto.label" />}
                            verdi={
                                søknadFraStore.formue.harInnskuddPåKonto
                                    ? 'Ja'
                                    : søknadFraStore.formue.harInnskuddPåKonto === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.formue.harInnskuddPåKonto && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.innskuddsBeløp.label" />}
                                verdi={
                                    søknadFraStore.formue.innskuddsBeløp
                                        ? søknadFraStore.formue.innskuddsBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.harVerdipapir.label" />}
                            verdi={
                                søknadFraStore.formue.harVerdipapir
                                    ? 'Ja'
                                    : søknadFraStore.formue.harVerdipapir === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.formue.verdipapirBeløp && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.verdipapirBeløp.label" />}
                                verdi={
                                    søknadFraStore.formue.verdipapirBeløp
                                        ? søknadFraStore.formue.verdipapirBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.skylderNoenMegPenger.label" />}
                            verdi={
                                søknadFraStore.formue.skylderNoenMegPenger
                                    ? 'Ja'
                                    : søknadFraStore.formue.skylderNoenMegPenger === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.formue.skylderNoenMegPenger && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.skylderNoenMegPengerBeløp.label" />}
                                verdi={
                                    søknadFraStore.formue.skylderNoenMegPengerBeløp
                                        ? søknadFraStore.formue.skylderNoenMegPengerBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.harKontanterOver1000.label" />}
                            verdi={
                                søknadFraStore.formue.harKontanterOver1000
                                    ? 'Ja'
                                    : søknadFraStore.formue.harKontanterOver1000 === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.formue.harKontanterOver1000 && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.kontanterBeløp.label" />}
                                verdi={
                                    søknadFraStore.formue.kontanterBeløp
                                        ? søknadFraStore.formue.kontanterBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                    </Ekspanderbartpanel>

                    <Ekspanderbartpanel
                        className={styles.ekspanderbarOppsumeringSeksjon}
                        tittel={intl.formatMessage({ id: 'panel.tittel.dinInntekt' })}
                    >
                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.harForventetInntekt.label" />}
                            verdi={
                                søknadFraStore.inntekt.harForventetInntekt
                                    ? 'Ja'
                                    : søknadFraStore.inntekt.harForventetInntekt === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknadFraStore.inntekt.forventetInntekt &&
                            Number(søknadFraStore.inntekt.forventetInntekt) > 0 && (
                                <OppsummeringsFelt
                                    label={<FormattedMessage id="input.forventetInntekt.label" />}
                                    verdi={søknadFraStore.inntekt.forventetInntekt}
                                />
                            )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.tjenerPengerIUtlandet.label" />}
                            verdi={
                                søknadFraStore.inntekt.tjenerPengerIUtlandet
                                    ? 'Ja'
                                    : søknadFraStore.inntekt.tjenerPengerIUtlandet === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.inntekt.tjenerPengerIUtlandet && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.tjenerPengerIUtlandetBeløp.label" />}
                                verdi={
                                    søknadFraStore.inntekt.tjenerPengerIUtlandetBeløp
                                        ? søknadFraStore.inntekt.tjenerPengerIUtlandetBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.andreYtelserINAV.label" />}
                            verdi={
                                søknadFraStore.inntekt.andreYtelserINav
                                    ? 'Ja'
                                    : søknadFraStore.inntekt.andreYtelserINav === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.inntekt.andreYtelserINav && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.andreYtelserINavYtelse.label" />}
                                verdi={
                                    søknadFraStore.inntekt.andreYtelserINavYtelse
                                        ? søknadFraStore.inntekt.andreYtelserINavYtelse
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        {søknadFraStore.inntekt.andreYtelserINav && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.andreYtelserINavBeløp.label" />}
                                verdi={
                                    søknadFraStore.inntekt.andreYtelserINavBeløp
                                        ? søknadFraStore.inntekt.andreYtelserINavBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandlet.label" />}
                            verdi={
                                søknadFraStore.inntekt.søktAndreYtelserIkkeBehandlet
                                    ? 'Ja'
                                    : søknadFraStore.inntekt.søktAndreYtelserIkkeBehandlet === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknadFraStore.inntekt.søktAndreYtelserIkkeBehandlet && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandletBegrunnelse.label" />}
                                verdi={
                                    søknadFraStore.inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                                        ? søknadFraStore.inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                                        : 'Ubesvart'
                                }
                            />
                        )}

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
                        {søknadFraStore.inntekt.harMottattSosialstønad && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.sosialStønadBeløp.label" />}
                                verdi={
                                    søknadFraStore.inntekt.sosialStønadBeløp
                                        ? søknadFraStore.inntekt.sosialStønadBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}

                        <OppsummeringsFelt
                            label={<FormattedMessage id="input.trygdeytelserIUtlandet.label" />}
                            verdi={
                                søknadFraStore.inntekt.trygdeytelserIUtlandet
                                    ? 'Ja'
                                    : søknadFraStore.inntekt.trygdeytelserIUtlandet === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknadFraStore.inntekt.trygdeytelserIUtlandet && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.trygdeytelserIUtlandetBeløp.label" />}
                                verdi={
                                    søknadFraStore.inntekt.trygdeytelserIUtlandetBeløp
                                        ? søknadFraStore.inntekt.trygdeytelserIUtlandetBeløp
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        {søknadFraStore.inntekt.trygdeytelserIUtlandet && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.trygdeytelserIUtlandetType.label" />}
                                verdi={
                                    søknadFraStore.inntekt.trygdeytelserIUtlandetType
                                        ? søknadFraStore.inntekt.trygdeytelserIUtlandetType
                                        : 'Ubesvart'
                                }
                            />
                        )}
                        {søknadFraStore.inntekt.trygdeytelserIUtlandet && (
                            <OppsummeringsFelt
                                label={<FormattedMessage id="input.trygdeytelserIUtlandetFraHvem.label" />}
                                verdi={
                                    søknadFraStore.inntekt.trygdeytelserIUtlandetFraHvem
                                        ? søknadFraStore.inntekt.trygdeytelserIUtlandetFraHvem
                                        : 'Ubesvart'
                                }
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
                                        verdi={item.utreisedato ? reverseStr(item.utreisedato) : 'Ubesvart'}
                                    />
                                    <OppsummeringsFelt
                                        label={<FormattedMessage id="input.innreisedato" />}
                                        verdi={item.innreisedato ? reverseStr(item.innreisedato) : 'Ubesvart'}
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

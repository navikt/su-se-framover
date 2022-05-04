import { Calculator, Email, FileContent, Home, Plane, Saving } from '@navikt/ds-icons';
import { Accordion } from '@navikt/ds-react';
import React from 'react';
import { RawIntlProvider, FormattedDate } from 'react-intl';

import { Person } from '~src/api/personApi';
import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import stegMessages from '~src/pages/søknad/nb';
import boOgOppholdMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import flyktningstatusMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import uførevedtakMessages from '~src/pages/søknad/steg/uførevedtak/uførevedtak-nb';
import utenlandsoppholdMessages from '~src/pages/søknad/steg/utenlandsopphold/utenlandsopphold-nb';
import { Søknadssteg } from '~src/pages/søknad/types';
import { formatAdresse } from '~src/utils/format/formatUtils';

import * as sharedStyles from '../../../steg-shared.module.less';
import { EndreSvar } from '../components/EndreSvar';
import { FormueOppsummering } from '../components/FormueOppsummering';
import InntektsOppsummering from '../components/InntektsOppsummering';
import { Oppsummeringsfelt } from '../components/Oppsummeringsfelt';

import { ingenAdresseGrunnTekst } from './OppsummeringUtils';
import oppsummeringMessages from './søknadsoppsummering-nb';
import * as styles from './søknadsoppsummering.module.less';

const Søknadoppsummering = ({ søknad, søker }: { søknad: SøknadState; søker: Person }) => {
    const { intl, formatMessage } = useI18n({
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
            <Accordion>
                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <Email /> {formatMessage(Søknadssteg.Uførevedtak)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('uførevedtak.label')}
                            verdi={søknad.harUførevedtak ? 'Ja' : søknad.harUførevedtak === false ? 'Nei' : 'Ubesvart'}
                        />
                        <EndreSvar path={Søknadssteg.Uførevedtak} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <FileContent /> {formatMessage(Søknadssteg.FlyktningstatusOppholdstillatelse)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('flyktning.label')}
                            verdi={
                                søknad.flyktningstatus.erFlyktning
                                    ? 'Ja'
                                    : søknad.flyktningstatus.erFlyktning === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        <Oppsummeringsfelt
                            label={formatMessage('norsk.statsborger.label')}
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
                                label={formatMessage('oppholdstillatelse.label')}
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
                                label={formatMessage('oppholdstillatelse.type')}
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
                            label={formatMessage('statsborger.andre.land.label')}
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
                                label={formatMessage('statsborger.andre.land.fritekst')}
                                verdi={søknad.flyktningstatus.statsborgerskapAndreLandFritekst}
                            />
                        )}
                        <EndreSvar path={Søknadssteg.FlyktningstatusOppholdstillatelse} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <Home /> {formatMessage(Søknadssteg.BoOgOppholdINorge)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('borOgOppholderSegINorge.label')}
                            verdi={
                                søknad.boOgOpphold.borOgOppholderSegINorge
                                    ? 'Ja'
                                    : søknad.boOgOpphold.borOgOppholderSegINorge === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        <Oppsummeringsfelt
                            label={formatMessage('delerBoligMed.delerBoligMedPersonOver18')}
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
                                label={formatMessage('delerBoligMed.delerMedHvem')}
                                verdi={
                                    søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                                        ? formatMessage('delerBoligMed.eps')
                                        : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
                                        ? formatMessage('delerBoligMed.voksneBarn')
                                        : formatMessage('delerBoligMed.andreVoksne')
                                }
                            />
                        )}
                        {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER &&
                            søknad.boOgOpphold.ektefellePartnerSamboer && (
                                <>
                                    <Oppsummeringsfelt
                                        label={formatMessage('input.ektefelleEllerSamboerFnr.label')}
                                        verdi={søknad.boOgOpphold.ektefellePartnerSamboer.fnr}
                                    />
                                    <Oppsummeringsfelt
                                        label={formatMessage('delerBoligMed.epsUførFlyktning')}
                                        verdi={
                                            søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning ? 'Ja' : 'Nei'
                                        }
                                    />
                                </>
                            )}

                        <Oppsummeringsfelt
                            label={formatMessage('innlagtPåInstitusjon.label')}
                            verdi={
                                søknad.boOgOpphold.innlagtPåInstitusjon
                                    ? 'Ja'
                                    : søknad.boOgOpphold.innlagtPåInstitusjon === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />

                        {søknad.boOgOpphold.innlagtPåInstitusjon && (
                            <>
                                <Oppsummeringsfelt
                                    label={formatMessage('innlagtPåInstitusjon.datoForInnleggelse')}
                                    verdi={
                                        søknad.boOgOpphold.datoForInnleggelse && (
                                            <FormattedDate value={søknad.boOgOpphold.datoForInnleggelse} />
                                        )
                                    }
                                />

                                {søknad.boOgOpphold.datoForUtskrivelse ? (
                                    <Oppsummeringsfelt
                                        label={formatMessage('innlagtPåInstitusjon.datoForUtskrivelse')}
                                        verdi={
                                            søknad.boOgOpphold.datoForInnleggelse && (
                                                <FormattedDate value={søknad.boOgOpphold.datoForUtskrivelse} />
                                            )
                                        }
                                    />
                                ) : (
                                    <Oppsummeringsfelt
                                        label={formatMessage('innlagtPåInstitusjon.fortsattInnlagt')}
                                        verdi={søknad.boOgOpphold.fortsattInnlagt ? 'Ja' : 'Nei'}
                                    />
                                )}
                            </>
                        )}

                        <Oppsummeringsfelt
                            label={formatMessage('boOgOpphold.adresse')}
                            verdi={
                                søknad.boOgOpphold.borPåAdresse
                                    ? formatAdresse(søknad.boOgOpphold.borPåAdresse)
                                    : ingenAdresseGrunnTekst(søknad.boOgOpphold.ingenAdresseGrunn, intl) ?? 'Ubesvart'
                            }
                        />

                        <EndreSvar path={Søknadssteg.BoOgOppholdINorge} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <Saving /> {formatMessage(Søknadssteg.DinFormue)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <FormueOppsummering formue={søknad.formue} tilhører={'søker'} />
                        <EndreSvar path={Søknadssteg.DinFormue} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <Calculator /> {formatMessage(Søknadssteg.DinInntekt)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <InntektsOppsummering inntekt={søknad.inntekt} tilhører={'søker'} />
                        <EndreSvar path={Søknadssteg.DinInntekt} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>

                {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                    <>
                        <Accordion.Item>
                            <Accordion.Header type="button">
                                <div className={styles.headerContent}>
                                    <Saving /> {formatMessage(Søknadssteg.EktefellesFormue)}
                                </div>
                            </Accordion.Header>
                            <Accordion.Content>
                                <FormueOppsummering formue={søknad.ektefelle.formue} tilhører={'eps'} />
                                <EndreSvar path={Søknadssteg.EktefellesFormue} søker={søker} />
                            </Accordion.Content>
                        </Accordion.Item>
                        <Accordion.Item>
                            <Accordion.Header type="button">
                                <div className={styles.headerContent}>
                                    <Calculator /> {formatMessage(Søknadssteg.EktefellesInntekt)}
                                </div>
                            </Accordion.Header>
                            <Accordion.Content>
                                <InntektsOppsummering inntekt={søknad.ektefelle.inntekt} tilhører={'eps'} />
                                <EndreSvar path={Søknadssteg.EktefellesInntekt} søker={søker} />
                            </Accordion.Content>
                        </Accordion.Item>
                    </>
                )}

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <Plane /> {formatMessage(Søknadssteg.ReiseTilUtlandet)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('harReistSiste90.label')}
                            verdi={
                                søknad.utenlandsopphold.harReistTilUtlandetSiste90dager
                                    ? 'Ja'
                                    : søknad.utenlandsopphold.harReistTilUtlandetSiste90dager === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknad.utenlandsopphold.harReistTilUtlandetSiste90dager && (
                            <ul>
                                {søknad.utenlandsopphold.harReistDatoer.map((item, index) => (
                                    <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                                        <Oppsummeringsfelt
                                            label={formatMessage('utreisedato.label')}
                                            verdi={
                                                item.utreisedato ? (
                                                    <FormattedDate value={item.utreisedato} />
                                                ) : (
                                                    'Ubesvart'
                                                )
                                            }
                                        />
                                        <Oppsummeringsfelt
                                            label={formatMessage('innreisedato.label')}
                                            verdi={
                                                item.innreisedato ? (
                                                    <FormattedDate value={item.innreisedato} />
                                                ) : (
                                                    'Ubesvart'
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Oppsummeringsfelt
                            label={formatMessage('skalReiseNeste12.label')}
                            verdi={
                                søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
                                    ? 'Ja'
                                    : søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder === false
                                    ? 'Nei'
                                    : 'Ubesvart'
                            }
                        />
                        {søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder && (
                            <ul>
                                {søknad.utenlandsopphold.skalReiseDatoer.map((item, index) => (
                                    <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                                        <Oppsummeringsfelt
                                            label={formatMessage('utreisedato.label')}
                                            verdi={
                                                item.utreisedato ? (
                                                    <FormattedDate value={item.utreisedato} />
                                                ) : (
                                                    'Ubesvart'
                                                )
                                            }
                                        />
                                        <Oppsummeringsfelt
                                            label={formatMessage('innreisedato.label')}
                                            verdi={
                                                item.innreisedato ? (
                                                    <FormattedDate value={item.innreisedato} />
                                                ) : (
                                                    'Ubesvart'
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <EndreSvar path={Søknadssteg.ReiseTilUtlandet} søker={søker} />
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </RawIntlProvider>
    );
};

export default Søknadoppsummering;

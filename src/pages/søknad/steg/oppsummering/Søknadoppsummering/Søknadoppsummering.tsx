import {
    CalculatorIcon,
    EnvelopeClosedIcon,
    FileTextIcon,
    HouseIcon,
    AirplaneIcon,
    PiggybankIcon,
} from '@navikt/aksel-icons';
import { Accordion } from '@navikt/ds-react';
import { RawIntlProvider, FormattedDate } from 'react-intl';

import { AlderssøknadState, SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import stegMessages from '~src/pages/søknad/nb';
import alderspensjonMessages from '~src/pages/søknad/steg/alderspensjon/alderspensjon-nb';
import boOgOppholdMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import flyktningstatusMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import oppholdstillatelseMessages from '~src/pages/søknad/steg/oppholdstillatelse/oppholdstillatelse-nb';
import uførevedtakMessages from '~src/pages/søknad/steg/uførevedtak/uførevedtak-nb';
import utenlandsoppholdMessages from '~src/pages/søknad/steg/utenlandsopphold/utenlandsopphold-nb';
import { Alderssteg, Fellessteg, Uføresteg } from '~src/pages/søknad/types';
import { Sakstype } from '~src/types/Sak';
import { formatAdresse } from '~src/utils/format/formatUtils';

import sharedStyles from '../../../steg-shared.module.less';
import { EndreSvar } from '../components/EndreSvar';
import { FormueOppsummering } from '../components/FormueOppsummering';
import InntektsOppsummering from '../components/InntektsOppsummering';
import { Oppsummeringsfelt } from '../components/Oppsummeringsfelt';

import { ingenAdresseGrunnTekst } from './OppsummeringUtils';
import oppsummeringMessages from './søknadsoppsummering-nb';
import styles from './søknadsoppsummering.module.less';

const booleanSvar = (bool: Nullable<boolean>, formatMessage: MessageFormatter<typeof oppsummeringMessages>) =>
    bool ? formatMessage('ja') : bool === false ? formatMessage('nei') : formatMessage('ubesvart');

const Søknadoppsummering = ({ søknad, sakstype }: { søknad: SøknadState; sakstype: Sakstype }) => {
    const { intl, formatMessage } = useI18n({
        messages: {
            ...stegMessages,
            ...uførevedtakMessages,
            ...alderspensjonMessages,
            ...oppholdstillatelseMessages,
            ...flyktningstatusMessages,
            ...boOgOppholdMessages,
            ...utenlandsoppholdMessages,
            ...oppsummeringMessages,
        },
    });

    return (
        <RawIntlProvider value={intl}>
            <Accordion>
                {sakstype === Sakstype.Uføre && <UføreOppsummering søknad={søknad} formatMessage={formatMessage} />}
                {sakstype === Sakstype.Alder && (
                    <AlderspensjonOppsummering søknad={søknad} formatMessage={formatMessage} />
                )}

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <HouseIcon fontSize={'25px'} /> {formatMessage(Fellessteg.BoOgOppholdINorge)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('borOgOppholderSegINorge.label')}
                            verdi={booleanSvar(søknad.boOgOpphold.borOgOppholderSegINorge, formatMessage)}
                        />
                        <Oppsummeringsfelt
                            label={formatMessage('delerBoligMed.delerBoligMedPersonOver18')}
                            verdi={booleanSvar(søknad.boOgOpphold.delerBoligMedPersonOver18, formatMessage)}
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
                                            søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning
                                                ? formatMessage('ja')
                                                : formatMessage('nei')
                                        }
                                    />
                                </>
                            )}

                        <Oppsummeringsfelt
                            label={formatMessage('innlagtPåInstitusjon.label')}
                            verdi={booleanSvar(søknad.boOgOpphold.innlagtPåInstitusjon, formatMessage)}
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
                                        verdi={booleanSvar(søknad.boOgOpphold.fortsattInnlagt, formatMessage)}
                                    />
                                )}
                            </>
                        )}

                        <Oppsummeringsfelt
                            label={formatMessage('boOgOpphold.adresse')}
                            verdi={
                                søknad.boOgOpphold.borPåAdresse
                                    ? formatAdresse(søknad.boOgOpphold.borPåAdresse)
                                    : (ingenAdresseGrunnTekst(søknad.boOgOpphold.ingenAdresseGrunn, intl) ??
                                      formatMessage('ubesvart'))
                            }
                        />

                        <EndreSvar path={Fellessteg.BoOgOppholdINorge} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <PiggybankIcon fontSize={'25px'} /> {formatMessage(Fellessteg.DinFormue)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <FormueOppsummering formue={søknad.formue} tilhører={'søker'} />
                        <EndreSvar path={Fellessteg.DinFormue} />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <CalculatorIcon fontSize={'25px'} /> {formatMessage(Fellessteg.DinInntekt)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <InntektsOppsummering inntekt={søknad.inntekt} tilhører={'søker'} />
                        <EndreSvar path={Fellessteg.DinInntekt} />
                    </Accordion.Content>
                </Accordion.Item>

                {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                    <>
                        <Accordion.Item>
                            <Accordion.Header type="button">
                                <div className={styles.headerContent}>
                                    <PiggybankIcon fontSize={'25px'} /> {formatMessage(Fellessteg.EktefellesFormue)}
                                </div>
                            </Accordion.Header>
                            <Accordion.Content>
                                <FormueOppsummering formue={søknad.ektefelle.formue} tilhører={'eps'} />
                                <EndreSvar path={Fellessteg.EktefellesFormue} />
                            </Accordion.Content>
                        </Accordion.Item>
                        <Accordion.Item>
                            <Accordion.Header type="button">
                                <div className={styles.headerContent}>
                                    <CalculatorIcon fontSize={'25px'} /> {formatMessage(Fellessteg.EktefellesInntekt)}
                                </div>
                            </Accordion.Header>
                            <Accordion.Content>
                                <InntektsOppsummering inntekt={søknad.ektefelle.inntekt} tilhører={'eps'} />
                                <EndreSvar path={Fellessteg.EktefellesInntekt} />
                            </Accordion.Content>
                        </Accordion.Item>
                    </>
                )}

                <Accordion.Item>
                    <Accordion.Header type="button">
                        <div className={styles.headerContent}>
                            <AirplaneIcon fontSize={'25px'} /> {formatMessage(Fellessteg.ReiseTilUtlandet)}
                        </div>
                    </Accordion.Header>
                    <Accordion.Content>
                        <Oppsummeringsfelt
                            label={formatMessage('harReistSiste90.label')}
                            verdi={booleanSvar(søknad.utenlandsopphold.harReistTilUtlandetSiste90dager, formatMessage)}
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
                                                    formatMessage('ubesvart')
                                                )
                                            }
                                        />
                                        <Oppsummeringsfelt
                                            label={formatMessage('innreisedato.label')}
                                            verdi={
                                                item.innreisedato ? (
                                                    <FormattedDate value={item.innreisedato} />
                                                ) : (
                                                    formatMessage('ubesvart')
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Oppsummeringsfelt
                            label={formatMessage('skalReiseNeste12.label')}
                            verdi={booleanSvar(
                                søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder,
                                formatMessage,
                            )}
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
                                                    formatMessage('ubesvart')
                                                )
                                            }
                                        />
                                        <Oppsummeringsfelt
                                            label={formatMessage('innreisedato.label')}
                                            verdi={
                                                item.innreisedato ? (
                                                    <FormattedDate value={item.innreisedato} />
                                                ) : (
                                                    formatMessage('ubesvart')
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <EndreSvar path={Fellessteg.ReiseTilUtlandet} />
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </RawIntlProvider>
    );
};

const UføreOppsummering = ({
    søknad,
    formatMessage,
}: {
    søknad: SøknadState;
    formatMessage: MessageFormatter<
        typeof uførevedtakMessages & typeof flyktningstatusMessages & typeof stegMessages & typeof oppsummeringMessages
    >;
}) => (
    <>
        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <EnvelopeClosedIcon fontSize={'25px'} /> {formatMessage(Uføresteg.Uførevedtak)}
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={formatMessage('uførevedtak.label')}
                    verdi={booleanSvar(søknad.harUførevedtak, formatMessage)}
                />
                <EndreSvar path={Uføresteg.Uførevedtak} />
            </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <FileTextIcon fontSize={'25px'} /> {formatMessage(Uføresteg.FlyktningstatusOppholdstillatelse)}
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={formatMessage('flyktning.label')}
                    verdi={booleanSvar(søknad.flyktningstatus.erFlyktning, formatMessage)}
                />
                <Oppsummeringsfelt
                    label={formatMessage('norsk.statsborger.label')}
                    verdi={booleanSvar(søknad.flyktningstatus.erNorskStatsborger, formatMessage)}
                />

                {søknad.flyktningstatus.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={formatMessage('oppholdstillatelse.label')}
                        verdi={booleanSvar(søknad.flyktningstatus.harOppholdstillatelse, formatMessage)}
                    />
                )}

                {søknad.flyktningstatus.harOppholdstillatelse && (
                    <Oppsummeringsfelt
                        label={formatMessage('oppholdstillatelse.type')}
                        verdi={
                            søknad.flyktningstatus.typeOppholdstillatelse
                                ? formatMessage(søknad.flyktningstatus.typeOppholdstillatelse)
                                : formatMessage('ubesvart')
                        }
                    />
                )}

                <Oppsummeringsfelt
                    label={formatMessage('statsborger.andre.land.label')}
                    verdi={booleanSvar(søknad.flyktningstatus.statsborgerskapAndreLand, formatMessage)}
                />

                {søknad.flyktningstatus.statsborgerskapAndreLand && (
                    <Oppsummeringsfelt
                        label={formatMessage('statsborger.andre.land.fritekst')}
                        verdi={søknad.flyktningstatus.statsborgerskapAndreLandFritekst}
                    />
                )}
                <EndreSvar path={Uføresteg.FlyktningstatusOppholdstillatelse} />
            </Accordion.Content>
        </Accordion.Item>
    </>
);

const AlderspensjonOppsummering = ({
    søknad,
    formatMessage,
}: {
    søknad: AlderssøknadState;
    formatMessage: MessageFormatter<
        typeof alderspensjonMessages &
            typeof oppholdstillatelseMessages &
            typeof stegMessages &
            typeof oppsummeringMessages
    >;
}) => (
    <>
        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <EnvelopeClosedIcon fontSize={'25px'} /> {formatMessage(Alderssteg.Alderspensjon)}
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={formatMessage('alderspensjon.label')}
                    verdi={booleanSvar(søknad.harSøktAlderspensjon, formatMessage)}
                />
                <EndreSvar path={Alderssteg.Alderspensjon} />
            </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <FileTextIcon fontSize={'25px'} /> {formatMessage(Alderssteg.Oppholdstillatelse)}
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={formatMessage('statsborger.label')}
                    verdi={booleanSvar(søknad.oppholdstillatelse.erNorskStatsborger, formatMessage)}
                />

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={formatMessage('eøsborger.label')}
                        verdi={booleanSvar(søknad.oppholdstillatelse.eøsborger, formatMessage)}
                    />
                )}

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={formatMessage('oppholdstillatelse.label')}
                        verdi={booleanSvar(søknad.oppholdstillatelse.harOppholdstillatelse, formatMessage)}
                    />
                )}

                <Oppsummeringsfelt
                    label={formatMessage('familieforening.label')}
                    verdi={booleanSvar(søknad.oppholdstillatelse.familieforening, formatMessage)}
                />

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={formatMessage('typeOppholdstillatelse.label')}
                        verdi={
                            søknad.oppholdstillatelse.typeOppholdstillatelse
                                ? formatMessage(søknad.oppholdstillatelse.typeOppholdstillatelse)
                                : formatMessage('ubesvart')
                        }
                    />
                )}

                <Oppsummeringsfelt
                    label={formatMessage('statsborgerskapAndreLand.label')}
                    verdi={booleanSvar(søknad.oppholdstillatelse.statsborgerskapAndreLand, formatMessage)}
                />

                {søknad.oppholdstillatelse.statsborgerskapAndreLand && (
                    <Oppsummeringsfelt
                        label={formatMessage('statsborgerskapAndreLand.label')}
                        verdi={søknad.oppholdstillatelse.statsborgerskapAndreLandFritekst}
                    />
                )}
                <EndreSvar path={Alderssteg.Oppholdstillatelse} />
            </Accordion.Content>
        </Accordion.Item>
    </>
);

export default Søknadoppsummering;

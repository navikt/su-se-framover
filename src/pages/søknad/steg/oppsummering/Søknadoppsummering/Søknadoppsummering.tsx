import {
    CalculatorIcon,
    EnvelopeClosedIcon,
    FileTextIcon,
    HouseIcon,
    AirplaneIcon,
    PiggybankIcon,
} from '@navikt/aksel-icons';
import { Accordion } from '@navikt/ds-react';
import { FormattedDate } from 'react-intl';

import { AlderssøknadState, SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';
import { Alderssteg, Fellessteg, Uføresteg } from '~src/pages/søknad/types';
import { Sakstype } from '~src/types/Sak';
import { formatAdresse } from '~src/utils/format/formatUtils';

import sharedStyles from '../../../steg-shared.module.less';
import { EndreSvar } from '../components/EndreSvar';
import { FormueOppsummering } from '../components/FormueOppsummering';
import InntektsOppsummering from '../components/InntektsOppsummering';
import { Oppsummeringsfelt } from '../components/Oppsummeringsfelt';

import { ingenAdresseGrunnTekst } from './OppsummeringUtils';
import styles from './søknadsoppsummering.module.less';

const booleanSvar = (bool: Nullable<boolean>) => (bool ? 'Ja' : bool === false ? 'Nei' : 'Ubesvart');

const Søknadoppsummering = ({ søknad, sakstype }: { søknad: SøknadState; sakstype: Sakstype }) => {
    return (
        <Accordion>
            {sakstype === Sakstype.Uføre && <UføreOppsummering søknad={søknad} />}
            {sakstype === Sakstype.Alder && <AlderspensjonOppsummering søknad={søknad} />}

            <Accordion.Item>
                <Accordion.Header type="button">
                    <div className={styles.headerContent}>
                        <HouseIcon fontSize={'25px'} /> Bo og opphold i Norge
                    </div>
                </Accordion.Header>
                <Accordion.Content>
                    <Oppsummeringsfelt
                        label={'Bor og oppholder du deg i Norge?'}
                        verdi={booleanSvar(søknad.boOgOpphold.borOgOppholderSegINorge)}
                    />
                    <Oppsummeringsfelt
                        label={'Deler du bolig med noen over 18 år?'}
                        verdi={booleanSvar(søknad.boOgOpphold.delerBoligMedPersonOver18)}
                    />
                    {søknad.boOgOpphold.delerBoligMedPersonOver18 && (
                        <Oppsummeringsfelt
                            label={'Hvem deler du bolig med?'}
                            verdi={
                                søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                                    ? 'Ektefelle eller samboer'
                                    : søknad.boOgOpphold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
                                      ? 'Voksne barn'
                                      : 'Andre voksne'
                            }
                        />
                    )}
                    {søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER &&
                        søknad.boOgOpphold.ektefellePartnerSamboer && (
                            <>
                                <Oppsummeringsfelt
                                    label="Fødselsnummeret til ektefelle eller samboer"
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer.fnr}
                                />
                                <Oppsummeringsfelt
                                    label="Er ektefelle eller samboer ufør flyktning?"
                                    verdi={søknad.boOgOpphold.ektefellePartnerSamboer?.erUførFlyktning ? 'Ja' : 'Nei'}
                                />
                            </>
                        )}

                    <Oppsummeringsfelt
                        label="Har du vært innlagt på institusjon de siste tre månedene?"
                        verdi={booleanSvar(søknad.boOgOpphold.innlagtPåInstitusjon)}
                    />

                    {søknad.boOgOpphold.innlagtPåInstitusjon && (
                        <>
                            <Oppsummeringsfelt
                                label="Datoen for innleggelsen"
                                verdi={
                                    søknad.boOgOpphold.datoForInnleggelse && (
                                        <FormattedDate value={søknad.boOgOpphold.datoForInnleggelse} />
                                    )
                                }
                            />

                            {søknad.boOgOpphold.datoForUtskrivelse ? (
                                <Oppsummeringsfelt
                                    label="Datoen for utskrivelsen"
                                    verdi={
                                        søknad.boOgOpphold.datoForInnleggelse && (
                                            <FormattedDate value={søknad.boOgOpphold.datoForUtskrivelse} />
                                        )
                                    }
                                />
                            ) : (
                                <Oppsummeringsfelt
                                    label="Er fortsatt innlagt på institusjon"
                                    verdi={booleanSvar(søknad.boOgOpphold.fortsattInnlagt)}
                                />
                            )}
                        </>
                    )}

                    <Oppsummeringsfelt
                        label="Adresse"
                        verdi={
                            søknad.boOgOpphold.borPåAdresse
                                ? formatAdresse(søknad.boOgOpphold.borPåAdresse)
                                : ingenAdresseGrunnTekst(søknad.boOgOpphold.ingenAdresseGrunn) ?? 'Ubesvart'
                        }
                    />

                    <EndreSvar path={Fellessteg.BoOgOppholdINorge} />
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item>
                <Accordion.Header type="button">
                    <div className={styles.headerContent}>
                        <PiggybankIcon fontSize={'25px'} /> Din formue
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
                        <CalculatorIcon fontSize={'25px'} /> Din inntekt
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
                                <PiggybankIcon fontSize={'25px'} /> Ektefelle/samboers formue
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
                                <CalculatorIcon fontSize={'25px'} /> Ektefelle/samboers inntekt
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
                        <AirplaneIcon fontSize={'25px'} /> Reise til utlandet
                    </div>
                </Accordion.Header>
                <Accordion.Content>
                    <Oppsummeringsfelt
                        label="Har du reist til utlandet de siste 90 dagene?"
                        verdi={booleanSvar(søknad.utenlandsopphold.harReistTilUtlandetSiste90dager)}
                    />
                    {søknad.utenlandsopphold.harReistTilUtlandetSiste90dager && (
                        <ul>
                            {søknad.utenlandsopphold.harReistDatoer.map((item, index) => (
                                <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                                    <Oppsummeringsfelt
                                        label="Utreisedato"
                                        verdi={
                                            item.utreisedato ? <FormattedDate value={item.utreisedato} /> : 'Ubesvart'
                                        }
                                    />
                                    <Oppsummeringsfelt
                                        label="Innreisedato"
                                        verdi={
                                            item.innreisedato ? <FormattedDate value={item.innreisedato} /> : 'Ubesvart'
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    <Oppsummeringsfelt
                        label="Har du planer om å reise til utlandet i de neste 12 månedene?"
                        verdi={booleanSvar(søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder)}
                    />
                    {søknad.utenlandsopphold.skalReiseTilUtlandetNeste12Måneder && (
                        <ul>
                            {søknad.utenlandsopphold.skalReiseDatoer.map((item, index) => (
                                <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                                    <Oppsummeringsfelt
                                        label="Utreisedato"
                                        verdi={
                                            item.utreisedato ? <FormattedDate value={item.utreisedato} /> : 'Ubesvart'
                                        }
                                    />
                                    <Oppsummeringsfelt
                                        label="Innreisedato"
                                        verdi={
                                            item.innreisedato ? <FormattedDate value={item.innreisedato} /> : 'Ubesvart'
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
    );
};

const UføreOppsummering = ({ søknad }: { søknad: SøknadState }) => (
    <>
        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <EnvelopeClosedIcon fontSize={'25px'} /> Uførevedtak
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label="Har du fått svar på søknaden din om uføretrygd?"
                    verdi={booleanSvar(søknad.harUførevedtak)}
                />
                <EndreSvar path={Uføresteg.Uførevedtak} />
            </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <FileTextIcon fontSize={'25px'} /> Flyktningstatus
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={'Er du registrert som flyktning?'}
                    verdi={booleanSvar(søknad.flyktningstatus.erFlyktning)}
                />
                <Oppsummeringsfelt
                    label={'Er du norsk statsborger?'}
                    verdi={booleanSvar(søknad.flyktningstatus.erNorskStatsborger)}
                />

                {søknad.flyktningstatus.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={'Har du oppholdstillatelse i Norge?'}
                        verdi={booleanSvar(søknad.flyktningstatus.harOppholdstillatelse)}
                    />
                )}

                {søknad.flyktningstatus.harOppholdstillatelse && (
                    <Oppsummeringsfelt
                        label={'Er oppholdstillatelsen din permanent eller midlertidig?'}
                        verdi={
                            søknad.flyktningstatus.typeOppholdstillatelse
                                ? søknad.flyktningstatus.typeOppholdstillatelse
                                : 'Ubesvart'
                        }
                    />
                )}

                <Oppsummeringsfelt
                    label={'Har du statsborgerskap i andre land enn Norge?'}
                    verdi={booleanSvar(søknad.flyktningstatus.statsborgerskapAndreLand)}
                />

                {søknad.flyktningstatus.statsborgerskapAndreLand && (
                    <Oppsummeringsfelt
                        label={'Hvilke land har du statsborgerskap i?'}
                        verdi={søknad.flyktningstatus.statsborgerskapAndreLandFritekst}
                    />
                )}
                <EndreSvar path={Uføresteg.FlyktningstatusOppholdstillatelse} />
            </Accordion.Content>
        </Accordion.Item>
    </>
);

const AlderspensjonOppsummering = ({ søknad }: { søknad: AlderssøknadState }) => (
    <>
        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <EnvelopeClosedIcon fontSize={'25px'} /> Alderspensjon
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={'Har du søkt om alderspensjon og fått svar på søknaden?'}
                    verdi={booleanSvar(søknad.harSøktAlderspensjon)}
                />
                <EndreSvar path={Alderssteg.Alderspensjon} />
            </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item>
            <Accordion.Header type="button">
                <div className={styles.headerContent}>
                    <FileTextIcon fontSize={'25px'} /> Oppholdstillatelse
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <Oppsummeringsfelt
                    label={'Er du norsk statsborger eller statsborger i et annet nordisk land?'}
                    verdi={booleanSvar(søknad.oppholdstillatelse.erNorskStatsborger)}
                />

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={'Er du EØS-borger eller familiemedlem til en EØS-borger?'}
                        verdi={booleanSvar(søknad.oppholdstillatelse.eøsborger)}
                    />
                )}

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={'Har du oppholdstillatelse i Norge?'}
                        verdi={booleanSvar(søknad.oppholdstillatelse.harOppholdstillatelse)}
                    />
                )}

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={
                            'Kom du til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller niese, og fikk oppholdstillatelse med krav til underhold?'
                        }
                        verdi={booleanSvar(søknad.oppholdstillatelse.familieforening)}
                    />
                )}

                {søknad.oppholdstillatelse.erNorskStatsborger === false && (
                    <Oppsummeringsfelt
                        label={'Er oppholdstillatelsen din permanent eller midlertidig?'}
                        verdi={
                            søknad.oppholdstillatelse.typeOppholdstillatelse
                                ? søknad.oppholdstillatelse.typeOppholdstillatelse
                                : 'Ubesvart'
                        }
                    />
                )}

                <Oppsummeringsfelt
                    label={'Har du statsborgerskap i andre land?'}
                    verdi={booleanSvar(søknad.oppholdstillatelse.statsborgerskapAndreLand)}
                />

                {søknad.oppholdstillatelse.statsborgerskapAndreLand && (
                    <Oppsummeringsfelt
                        label={'Har du statsborgerskap i andre land?'}
                        verdi={søknad.oppholdstillatelse.statsborgerskapAndreLandFritekst}
                    />
                )}
                <EndreSvar path={Alderssteg.Oppholdstillatelse} />
            </Accordion.Content>
        </Accordion.Item>
    </>
);

export default Søknadoppsummering;

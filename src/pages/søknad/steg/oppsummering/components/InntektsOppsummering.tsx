import { SøknadState } from '~src/features/søknad/søknad.slice';

import sharedStyles from '../../../steg-shared.module.less';

import { OppsummeringAvTrygdeytelser } from './OppsummeringAvTrygdeytelser';
import { Oppsummeringsfelt } from './Oppsummeringsfelt';

const InntektsOppsummering = ({
    inntekt,
    tilhører,
}: {
    inntekt: SøknadState['inntekt'];
    tilhører: 'søker' | 'eps';
}) => {
    return (
        <>
            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Forventer du å ha arbeidsinntekt fremover?'
                        : 'Forventer ektefelle/samboer å ha arbeidsinntekt fremover?'
                }
                verdi={inntekt.harForventetInntekt ? 'Ja' : inntekt.harForventetInntekt === false ? 'Nei' : 'Ubesvart'}
            />

            {inntekt.forventetInntekt && Number(inntekt.forventetInntekt) > 0 && (
                <Oppsummeringsfelt
                    label={
                        tilhører === 'søker'
                            ? 'Hvor mye regner du med å tjene i måneden?'
                            : 'Hvor mye regner de med å tjene i måneden?'
                    }
                    verdi={inntekt.forventetInntekt}
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Har du andre ytelser i NAV?'
                        : 'Har ektefelle/samboer andre ytelser fra NAV?'
                }
                verdi={inntekt.andreYtelserINav ? 'Ja' : inntekt.andreYtelserINav === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={'Hvilke ytelser?'}
                    verdi={inntekt.andreYtelserINavYtelse ? inntekt.andreYtelserINavYtelse : 'Ubesvart'}
                />
            )}
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={
                        tilhører === 'søker'
                            ? 'Hvor mye penger får du utbetalt i måneden?'
                            : 'Hvor mye penger får de utbetalt i måneden?'
                    }
                    verdi={inntekt.andreYtelserINavBeløp ? inntekt.andreYtelserINavBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Har du søkt om trygdeytelser som du ikke har fått svar på?'
                        : 'Har ektefelle/samboer søkt om trygdeytelser som de ikke har fått svar på?'
                }
                verdi={
                    inntekt.søktAndreYtelserIkkeBehandlet
                        ? 'Ja'
                        : inntekt.søktAndreYtelserIkkeBehandlet === false
                          ? 'Nei'
                          : 'Ubesvart'
                }
            />

            {inntekt.søktAndreYtelserIkkeBehandlet && (
                <Oppsummeringsfelt
                    label={'Hvilke?'}
                    verdi={
                        inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            : 'Ubesvart'
                    }
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Har du trygdeytelser fra andre land?'
                        : 'Har ektfelle/samboer trygdeytelser fra andre land?'
                }
                verdi={
                    inntekt.harTrygdeytelserIUtlandet
                        ? 'Ja'
                        : inntekt.harTrygdeytelserIUtlandet === false
                          ? 'Nei'
                          : 'Ubesvart'
                }
            />
            {inntekt.harTrygdeytelserIUtlandet && (
                <OppsummeringAvTrygdeytelser
                    arr={inntekt.trygdeytelserIUtlandet}
                    labelFirstEl={'Hvor mye får du i lokal valuta i måden?'}
                    labelScndEl={'Valuta'}
                    labelThirdEl={'Type ytelse'}
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Får du tjenestepensjon eller pensjon som ikke er fra NAV?'
                        : 'Får ektefelle/samboer tjenestepensjon eller pensjon som ikke er fra NAV?'
                }
                verdi={inntekt.mottarPensjon ? 'Ja' : inntekt.mottarPensjon === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.mottarPensjon && (
                <ul>
                    {inntekt.pensjonsInntekt.map((item, index) => (
                        <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                            <Oppsummeringsfelt label={'Hvem får du pengene fra?'} verdi={item.ordning} size="small" />
                            <Oppsummeringsfelt
                                label={'Hvor mye penger får du i måneden?'}
                                verdi={item.beløp}
                                size="small"
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default InntektsOppsummering;

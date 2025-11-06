import { BodyShort, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';
import styles from './OppsummeringAvSøknadinnhold.module.less';
import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvInntektOgPensjon = (props: {
    inntektOgPensjon: {
        søkers: InntektOgPensjon;
        eps?: Nullable<InntektOgPensjon>;
    };
}) => {
    const { formatMessage } = useI18n({ messages });
    const { søkers, eps } = props.inntektOgPensjon;
    return (
        <div>
            <OppsummeringsTrippel
                label={''}
                søkersVerdi={formatMessage('formue.heading.søker')}
                epsverdi={eps ? formatMessage('formue.heading.eps') : undefined}
            />
            <OppsummeringsTrippel
                label={formatMessage('inntektOgPensjon.forventerArbeidsinntekt')}
                søkersVerdi={søkers.forventetInntekt ?? formatMessage('svar.nei')}
                epsverdi={eps ? (eps?.forventetInntekt ?? formatMessage('svar.nei')) : null}
            />
            <OppsummeringsTrippel
                label={formatMessage('inntektOgPensjon.andreYtelserINav')}
                søkersVerdi={
                    søkers.andreYtelserINav
                        ? `${søkers.andreYtelserINav}: ${søkers.andreYtelserINavBeløp}`
                        : formatMessage('svar.nei')
                }
                epsverdi={
                    eps
                        ? eps?.andreYtelserINav
                            ? `${eps.andreYtelserINav}: ${eps.andreYtelserINavBeløp}`
                            : formatMessage('svar.nei')
                        : null
                }
            />
            <OppsummeringsTrippel
                label={formatMessage('inntektOgPensjon.andreYtelserIkkeBehandlet')}
                søkersVerdi={
                    søkers.søktAndreYtelserIkkeBehandletBegrunnelse
                        ? søkers.søktAndreYtelserIkkeBehandletBegrunnelse
                        : formatMessage('svar.nei')
                }
                epsverdi={
                    eps
                        ? eps?.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? eps.søktAndreYtelserIkkeBehandletBegrunnelse
                            : formatMessage('svar.nei')
                        : null
                }
            />

            {søkers.trygdeytelserIUtlandet?.map((ytelse) => (
                <OppsummeringsTrippel
                    key={`${ytelse.type} - ${ytelse.valuta} - ${ytelse.beløp}`}
                    label={formatMessage('inntektOgPensjon.ytelserIUtlandet')}
                    søkersVerdi={
                        <div className={styles.verdiElement}>
                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.type')}: {ytelse.type}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.valuta')}: {ytelse.valuta}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.beløp')}: {ytelse.beløp}
                            </Label>
                        </div>
                    }
                    epsverdi={eps ? '-' : null}
                />
            ))}
            {eps?.trygdeytelserIUtlandet?.map((ytelse) => (
                <OppsummeringsTrippel
                    key={`${ytelse.type} - ${ytelse.valuta} - ${ytelse.beløp}`}
                    label={formatMessage('inntektOgPensjon.ytelserIUtlandet')}
                    søkersVerdi={'-'}
                    epsverdi={
                        <div className={styles.verdiElement}>
                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.type')}: {ytelse.type}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.beløp')}: {ytelse.beløp}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.ytelserIUtlandet.valuta')}: {ytelse.valuta}
                            </Label>
                        </div>
                    }
                />
            ))}
            {søkers.pensjon?.map((p) => (
                <OppsummeringsTrippel
                    key={`${p.ordning} - ${p.beløp}`}
                    label={formatMessage('inntektOgPensjon.tjenestepensjon')}
                    søkersVerdi={
                        <div className={styles.verdiElement}>
                            <Label>
                                {formatMessage('inntektOgPensjon.tjenestepensjon.ordning')}: {p.ordning}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.tjenestepensjon.beløp')}: {p.beløp}
                            </Label>
                        </div>
                    }
                    epsverdi={eps ? '-' : null}
                />
            ))}
            {eps?.pensjon?.map((p) => (
                <OppsummeringsTrippel
                    key={`${p.ordning} - ${p.beløp}`}
                    label={formatMessage('inntektOgPensjon.tjenestepensjon')}
                    søkersVerdi={'-'}
                    epsverdi={
                        <div className={styles.verdiElement}>
                            <Label>
                                {formatMessage('inntektOgPensjon.tjenestepensjon.ordning')}: {p.ordning}
                            </Label>

                            <Label>
                                {formatMessage('inntektOgPensjon.tjenestepensjon.beløp')}: {p.beløp}
                            </Label>
                        </div>
                    }
                />
            ))}
        </div>
    );
};

export default OppsummeringAvInntektOgPensjon;

export const OppsummeringsTrippel = ({
    label,
    søkersVerdi,
    epsverdi,
}: {
    label: string;
    søkersVerdi: string | number | React.ReactElement;
    epsverdi?: Nullable<string | number | React.ReactElement>;
}) => {
    return (
        <div className={styles.oppsummeringstrippel}>
            <BodyShort>{label}</BodyShort>

            <div className={styles.oppsummeringsVerdier}>
                <Label>{søkersVerdi}</Label>
                <Label>{epsverdi}</Label>
            </div>
        </div>
    );
};

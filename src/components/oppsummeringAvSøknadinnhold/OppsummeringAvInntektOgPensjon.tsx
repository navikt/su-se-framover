import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvInntektOgPensjon = (props: {
    inntektOgPensjon: {
        søkers: InntektOgPensjon;
        eps?: Nullable<InntektOgPensjon>;
    };
    visesIVedtak?: boolean;
    fullSpace?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const { søkers, eps } = props.inntektOgPensjon;
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
                [styles.fullSpace]: props.fullSpace,
            })}
        >
            <OppsummeringsTrippel
                label={''}
                søkersVerdi={formatMessage('formue.heading.søker')}
                epsverdi={eps ? formatMessage('formue.heading.eps') : undefined}
            />
            <OppsummeringsTrippel
                label={formatMessage('inntektOgPensjon.forventerArbeidsinntekt')}
                søkersVerdi={søkers.forventetInntekt ?? formatMessage('svar.nei')}
                epsverdi={eps ? eps?.forventetInntekt ?? formatMessage('svar.nei') : null}
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
                        <div>
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
                    epsverdi={eps ? '-' : null}
                />
            ))}
            {eps?.trygdeytelserIUtlandet?.map((ytelse) => (
                <OppsummeringsTrippel
                    key={`${ytelse.type} - ${ytelse.valuta} - ${ytelse.beløp}`}
                    label={formatMessage('inntektOgPensjon.ytelserIUtlandet')}
                    søkersVerdi={'-'}
                    epsverdi={
                        <div>
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
                        <div>
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
                        <div>
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
    tightSpaced,
}: {
    label: string;
    søkersVerdi: string | number | JSX.Element;
    epsverdi?: Nullable<string | number | JSX.Element>;
    tightSpaced?: boolean;
}) => {
    return (
        <div className={styles.oppsummeringstrippel}>
            <BodyShort>{label}</BodyShort>
            <div
                className={classNames({
                    [styles.tightSpaced]: tightSpaced,
                    [styles.oppsummeringsVerdier]: !tightSpaced,
                })}
            >
                <Label>{søkersVerdi}</Label>
                <Label>{epsverdi}</Label>
            </div>
        </div>
    );
};

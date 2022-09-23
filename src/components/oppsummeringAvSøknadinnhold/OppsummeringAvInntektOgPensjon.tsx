import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';

import { FormueTrippel } from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvInntektOgPensjon = (props: {
    inntektOgPensjon: {
        søkers: InntektOgPensjon;
        eps?: Nullable<InntektOgPensjon>;
    };
    visesIVedtak?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const { søkers, eps } = props.inntektOgPensjon;
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <FormueTrippel
                label={''}
                søkersVerdi={formatMessage('formue.heading.søker')}
                epsverdi={eps ? formatMessage('formue.heading.eps') : undefined}
            />
            <FormueTrippel
                label={formatMessage('inntektOgPensjon.forventerArbeidsinntekt')}
                søkersVerdi={søkers.forventetInntekt ?? formatMessage('svar.nei')}
                epsverdi={eps ? eps?.forventetInntekt ?? formatMessage('svar.nei') : null}
            />
            <FormueTrippel
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
            <FormueTrippel
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
                <FormueTrippel
                    key={`${ytelse.type} - ${ytelse.valuta} - ${ytelse.beløp}`}
                    label={formatMessage('inntektOgPensjon.ytelserIUtlandet')}
                    søkersVerdi={
                        <div>
                            <div>type: {ytelse.type}</div>
                            <div>beløp: {ytelse.beløp}</div>
                            <div>valuta: {ytelse.valuta}</div>
                        </div>
                    }
                    //søkersVerdi={`type: ${ytelse.type} beløp: ${ytelse.beløp} valuta: ${ytelse.valuta}`}
                    epsverdi={eps ? '-' : null}
                />
            ))}
            {eps?.trygdeytelserIUtlandet?.map((ytelse) => (
                <FormueTrippel
                    key={`${ytelse.type} - ${ytelse.valuta} - ${ytelse.beløp}`}
                    label={formatMessage('inntektOgPensjon.ytelserIUtlandet')}
                    søkersVerdi={'-'}
                    epsverdi={
                        <div>
                            <div>type: {ytelse.type}</div>
                            <div>beløp: {ytelse.beløp}</div>
                            <div>valuta: {ytelse.valuta}</div>
                        </div>
                    }
                />
            ))}
            {søkers.pensjon?.map((p) => (
                <FormueTrippel
                    key={`${p.ordning} - ${p.beløp}`}
                    label={formatMessage('inntektOgPensjon.tjenestepensjon')}
                    søkersVerdi={
                        <div>
                            <div>Ordning: {p.ordning}</div>
                            <div>Beløp: {p.beløp}</div>
                        </div>
                    }
                    epsverdi={eps ? '-' : null}
                />
            ))}
            {eps?.pensjon?.map((p) => (
                <FormueTrippel
                    key={`${p.ordning} - ${p.beløp}`}
                    label={formatMessage('inntektOgPensjon.tjenestepensjon')}
                    søkersVerdi={'-'}
                    epsverdi={
                        <div>
                            <div>Ordning: {p.ordning}</div>
                            <div>Beløp: {p.beløp}</div>
                        </div>
                    }
                />
            ))}
        </div>
    );
};

export default OppsummeringAvInntektOgPensjon;

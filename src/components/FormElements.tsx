import classNames from 'classnames';
import { FormikErrors } from 'formik';
import { OppChevron, NedChevron } from 'nav-frontend-chevron';
import { Radio, RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

import { useI18n } from '~lib/hooks';
import { trackEvent, søknadHjelpeTekstKlikk } from '~lib/tracking/trackingEvents';

import nb from './formElements-nb';
import styles from './formElements.module.less';

export const JaNeiSpørsmål = (props: {
    id: string;
    legend: React.ReactNode;
    feil?: React.ReactNode;
    state: boolean | null;
    onChange: (value: boolean) => void;
    className?: string;
    hjelpetekstTittel?: string;
    hjelpetekstBody?: string;
    description?: string;
}) => {
    const intl = useI18n({ messages: nb });
    return (
        <div id={props.id} tabIndex={-1}>
            <RadioGruppe
                className={classNames(styles.janeisporsmal, props.className)}
                feil={props.feil}
                legend={props.legend}
                description={props.description}
            >
                {props.hjelpetekstTittel && props.hjelpetekstBody && (
                    <Hjelpetekst tittel={props.hjelpetekstTittel} body={props.hjelpetekstBody} />
                )}
                <div className={styles.svarContainer}>
                    <div className={styles.svar}>
                        <RadioPanel
                            label={intl.formatMessage({ id: 'jaNeiSpørsmal.label.ja' })}
                            name={props.id}
                            onChange={() => props.onChange(true)}
                            checked={props.state === null ? false : props.state}
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.svar}>
                        <RadioPanel
                            label={intl.formatMessage({ id: 'jaNeiSpørsmal.label.nei' })}
                            name={props.id}
                            onChange={() => props.onChange(false)}
                            checked={props.state === null ? false : !props.state}
                            autoComplete="off"
                        />
                    </div>
                </div>
            </RadioGruppe>
        </div>
    );
};

const Hjelpetekst = (props: { tittel: string; body: string }) => {
    const [visMer, setVisMer] = useState(false);

    return (
        <div className={styles.hjelpetekstContainer}>
            <button
                className={styles.hjelpetekstKnapp}
                onClick={(e) => {
                    e.preventDefault();
                    setVisMer(!visMer);
                    trackEvent(søknadHjelpeTekstKlikk());
                }}
            >
                {props.tittel}
                {visMer ? <OppChevron /> : <NedChevron />}
            </button>
            <Collapse isOpened={visMer}>{props.body}</Collapse>
        </div>
    );
};

export const SuperRadio = <T, U extends Extract<keyof T, string>>(props: {
    values: T;
    label: string;
    property: U;
    radioValue: T[U];
    onChange: (a: T) => void;
}) => (
    <Radio
        label={props.label}
        name={props.property}
        onChange={() =>
            props.onChange({
                ...props.values,
                [props.property]: props.radioValue,
            })
        }
        checked={props.values[props.property] === props.radioValue}
    />
);

export const SuperRadioGruppe = <T, U extends Extract<keyof T, string>>(props: {
    id: string;
    legend: string;
    values: T;
    errors: FormikErrors<T>;
    property: U;
    options: Array<{ label: string; radioValue: T[U] }>;
    onChange: (a: T) => void;
}) => (
    <div id={props.id} tabIndex={-1}>
        <RadioGruppe legend={props.legend} feil={props.errors[props.property]}>
            {props.options.map((e) => (
                <SuperRadio
                    key={`${props.property}${e.radioValue}`}
                    label={e.label}
                    values={props.values}
                    onChange={props.onChange}
                    property={props.property}
                    radioValue={e.radioValue}
                />
            ))}
        </RadioGruppe>
    </div>
);

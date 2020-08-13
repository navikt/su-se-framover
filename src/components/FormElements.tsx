import classNames from 'classnames';
import AlertStripe from 'nav-frontend-alertstriper';
import { OppChevron, NedChevron } from 'nav-frontend-chevron';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import React, { useState } from 'react';

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
}) => {
    const intl = useI18n({ messages: nb });
    return (
        <div id={props.id}>
            <RadioGruppe
                className={classNames(styles.janeisporsmal, props.className)}
                feil={props.feil}
                legend={props.legend}
            >
                {props.hjelpetekstTittel && props.hjelpetekstBody && (
                    <Hjelpetekst tittel={props.hjelpetekstTittel} body={props.hjelpetekstBody} />
                )}
                <div className={styles.svarContainer}>
                    <div className={styles.svar}>
                        <RadioPanel
                            label={intl.formatMessage({ id: 'jaNeiSpørsmal.label.ja' })}
                            name={props.id}
                            onClick={() => props.onChange(true)}
                            checked={props.state === null ? false : props.state}
                        />
                    </div>
                    <div className={styles.svar}>
                        <RadioPanel
                            label={intl.formatMessage({ id: 'jaNeiSpørsmal.label.nei' })}
                            name={props.id}
                            onClick={() => props.onChange(false)}
                            checked={props.state === null ? false : !props.state}
                        />
                    </div>
                </div>
            </RadioGruppe>
        </div>
    );
};

const Hjelpetekst = (props: { tittel: string; body: string }) => {
    const [visMer, setVisMer] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);

    const hjelpetekstClassName = () => {
        if (!firstLoad) {
            return `${styles.hjelpetekstBody} ${styles.hjelpetekstBodyFirstLoad}`;
        }

        if (visMer) {
            return `${styles.hjelpetekstBody} ${styles.hjelpetekstBodyOpen}`;
        } else {
            return `${styles.hjelpetekstBody} ${styles.hjelpetekstBodyClosed}`;
        }
    };

    return (
        <div className={styles.hjelpetekstContainer}>
            <button
                className={styles.hjelpetekstKnapp}
                onClick={(e) => {
                    e.preventDefault();
                    setFirstLoad(true);
                    setVisMer(!visMer);
                    trackEvent(søknadHjelpeTekstKlikk());
                }}
            >
                {props.tittel}
                {visMer ? <OppChevron /> : <NedChevron />}
            </button>

            <p className={hjelpetekstClassName()}>{props.body}</p>
        </div>
    );
};

export const AnbefalerIkkeSøke = (props: { className?: string }) => {
    const intl = useI18n({ messages: nb });
    return (
        <AlertStripe type="advarsel" className={props.className}>
            {intl.formatMessage({ id: 'anbefalerIkkeSøke.message' })}
        </AlertStripe>
    );
};

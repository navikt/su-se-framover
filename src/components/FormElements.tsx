import React, { useState } from 'react';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import AlertStripe from 'nav-frontend-alertstriper';
import classNames from 'classnames';
import styles from './formElements.module.less';
import nb from './formElements-nb';
import { useI18n } from '~lib/hooks';
import NavFrontendChevron from 'nav-frontend-chevron';

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
                <Hjelpetekst tittel={props.hjelpetekstTittel} body={props.hjelpetekstBody} />
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

const Hjelpetekst = (props: { tittel?: string; body?: string }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div>
            <p className={styles.linkColouredP} onClick={() => setExpanded(!expanded)}>
                {props.tittel} {expanded && <NavFrontendChevron type={'opp'} />}
            </p>
            {expanded && <p>{props.body}</p>}
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

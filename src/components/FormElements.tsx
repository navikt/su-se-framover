import React from 'react';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import AlertStripe from 'nav-frontend-alertstriper';
import classNames from 'classnames';
import styles from './formElements.module.less';
import nb from './formElements-nb';
import { useI18n } from '~lib/hooks';

export const JaNeiSpørsmål = (props: {
    id: string;
    legend: React.ReactNode;
    feil?: React.ReactNode;
    state: boolean | null;
    onChange: (value: boolean) => void;
    className?: string;
}) => {
    const intl = useI18n({ messages: nb });
    return (
        <div id={props.id}>
            <RadioGruppe
                className={classNames(styles.janeisporsmal, props.className)}
                feil={props.feil}
                legend={props.legend}
            >
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
            </RadioGruppe>
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

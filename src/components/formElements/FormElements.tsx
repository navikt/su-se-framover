import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { BodyShort, Radio, RadioGroup } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

import { useI18n } from '~lib/i18n';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadHjelpeTekstKlikk } from '~lib/tracking/trackingEvents';

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
    const { intl } = useI18n({ messages: nb });
    return (
        <RadioGroup
            className={classNames(props.className)}
            error={props.feil}
            legend={props.legend}
            description={
                props.description || (props.hjelpetekstTittel && props.hjelpetekstBody) ? (
                    <div>
                        {props.description && <BodyShort spacing>{props.description}</BodyShort>}
                        {props.hjelpetekstTittel && props.hjelpetekstBody && (
                            <Hjelpetekst tittel={props.hjelpetekstTittel} body={props.hjelpetekstBody} />
                        )}
                    </div>
                ) : undefined
            }
            value={props.state?.toString()}
            onChange={(val) => props.onChange(val === 'true')}
        >
            <Radio id={props.id} name={props.id} value="true" autoComplete="off">
                {intl.formatMessage({ id: 'jaNeiSpørsmål.label.ja' })}
            </Radio>
            <Radio name={props.id} value="false" autoComplete="off">
                {intl.formatMessage({ id: 'jaNeiSpørsmål.label.nei' })}
            </Radio>
        </RadioGroup>
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
                {visMer ? <CollapseFilled /> : <ExpandFilled />}
            </button>
            <Collapse isOpened={visMer}>{props.body}</Collapse>
        </div>
    );
};

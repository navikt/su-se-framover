import { Accordion, BodyShort, Checkbox, Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { useState } from 'react';

import { Kontrollsamtale, KontrollsamtaleStatus } from '~src/types/Kontrollsamtale';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import OppsummeringAvKontrollsamtale from '../OppsummeringAvKontrollsamtale';
import { kontrollsamtaleStatusTextMapper } from '../OppsummeringAvKontrollsamtaleUtils';

import styles from './OppsummeringAvKontrollsamtaler.module.less';

const OppsummeringAvKontrollsamtaler = (props: { sakId: string; kontrollsamtaler: Kontrollsamtale[] }) => {
    const [visAnnullerte, setVisAnnullerte] = useState(false);

    const filtrerteUtenlandsopphold = props.kontrollsamtaler
        .toSorted()
        .filter((it) => (visAnnullerte ? true : it.status !== KontrollsamtaleStatus.ANNULLERT));

    return props.kontrollsamtaler.length === 0 ? (
        <BodyShort>Ingen kontrollsamtaler registrert</BodyShort>
    ) : (
        <div className={styles.componentContainer}>
            <Oppsummeringsfiltrering annullert={{ value: visAnnullerte, set: setVisAnnullerte }} />
            <Accordion className={styles.accordion}>
                {filtrerteUtenlandsopphold.map((k) => (
                    <KontrollsamtaleAccordionItem key={k.id} sakId={props.sakId} k={k} />
                ))}
            </Accordion>
        </div>
    );
};

const KontrollsamtaleAccordionItem = (props: { sakId: string; k: Kontrollsamtale }) => {
    return (
        <Accordion.Item>
            <Accordion.Header
                className={classNames({
                    [styles.accordionHeader]: true,
                    [styles.grønn]: props.k.status === KontrollsamtaleStatus.GJENNOMFØRT,
                    [styles.gul]: props.k.status === KontrollsamtaleStatus.INNKALT,
                    [styles.rød]: props.k.status === KontrollsamtaleStatus.IKKE_MØTT_INNEN_FRIST,
                    [styles.blå]: props.k.status === KontrollsamtaleStatus.PLANLAGT_INNKALLING,
                    [styles.grå]: props.k.status === KontrollsamtaleStatus.ANNULLERT,
                })}
            >
                <Heading size="small">{formatMonthYear(props.k.innkallingsdato)}</Heading>
                <Heading size="small">{kontrollsamtaleStatusTextMapper(props.k.status)}</Heading>
            </Accordion.Header>
            <Accordion.Content>
                <OppsummeringAvKontrollsamtale sakId={props.sakId} kontrollsamtale={props.k} medEdit />
            </Accordion.Content>
        </Accordion.Item>
    );
};

const Oppsummeringsfiltrering = (props: { annullert: { value: boolean; set: (b: boolean) => void } }) => {
    return (
        <div className={styles.filterContainer}>
            <Checkbox checked={props.annullert.value} onChange={(e) => props.annullert.set(e.target.checked)}>
                Annullerte
            </Checkbox>
        </div>
    );
};

export default OppsummeringAvKontrollsamtaler;

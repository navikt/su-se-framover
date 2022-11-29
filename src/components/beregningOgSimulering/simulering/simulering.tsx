import { Alert, Button, Heading, Label, Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import React, { useState } from 'react';

import sharedMessages from '~src/components/beregningOgSimulering/beregning/beregning-nb';
import { CollapsableFormElementDescription } from '~src/components/formElements/FormElements';
import { combineOptions, pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { Simulering, SimulertUtbetalingstype } from '~src/types/Simulering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { groupWhile } from '~src/utils/array/arrayUtils';
import { formatMonthYear } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import messages from './simulering-nb';
import * as styles from './Simulering.module.less';

export const VisSimulering = (props: { behandling: Søknadsbehandling }) => {
    if (!props.behandling.simulering) {
        return <div>Behandlingen har ingen simulering</div>;
    }
    return <Utbetalingssimulering simulering={props.behandling.simulering} />;
};

export const Utbetalingssimulering = (props: { simulering: Simulering; utenTittel?: boolean }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [modalÅpen, setModalÅpen] = useState<boolean>(false);

    return (
        <div>
            <div className={styles.simuleringsHeader}>
                {!props.utenTittel && (
                    <Heading level="4" size="medium">
                        {formatMessage('simulering.tittel')}
                    </Heading>
                )}
            </div>
            {modalÅpen && (
                <SimuleringsDetaljerModal
                    simulering={props.simulering}
                    open={modalÅpen}
                    close={() => setModalÅpen(false)}
                />
            )}
            <Label className={classNames(styles.totalt, styles.linjeTittel)}>
                <span>{formatMessage('totaltBeløp')}</span>
                <span />
                <span className={styles.beløp}>
                    {formatCurrency(props.simulering.totalBruttoYtelse, { numDecimals: 0 })}
                </span>
            </Label>
            <div className={styles.grupertSimulering}>
                {pipe(
                    props.simulering.perioder,
                    groupWhile(
                        (curr, prev) =>
                            curr.bruttoYtelse === prev.bruttoYtelse &&
                            curr.type === prev.type &&
                            DateFns.differenceInCalendarMonths(
                                DateFns.parseISO(curr.fraOgMed),
                                DateFns.parseISO(prev.tilOgMed)
                            ) <= 1
                    ),
                    arr.map((gruppe) =>
                        pipe(
                            combineOptions([arr.head(gruppe), arr.last(gruppe)]),
                            Option.map(([head, last]) => (
                                <Label className={styles.linjeTittel} key={head.fraOgMed + head.tilOgMed}>
                                    <span className={styles.periode}>{`${formatMonthYear(
                                        head.fraOgMed
                                    )} - ${formatMonthYear(last.tilOgMed)}`}</span>
                                    <span className={styles.type}>
                                        {head.type !== SimulertUtbetalingstype.ORDINÆR ? formatMessage(head.type) : ''}
                                    </span>
                                    <span className={styles.beløp}>
                                        {formatCurrency(head.bruttoYtelse, { numDecimals: 0 })} {formatMessage('iMnd')}
                                    </span>
                                </Label>
                            )),
                            Option.getOrElse(() => (
                                <Alert variant="warning">{formatMessage('feil.manglerPerioder')}</Alert>
                            ))
                        )
                    )
                )}
            </div>

            <Button
                className={styles.detaljerKnapp}
                variant="tertiary"
                type="button"
                onClick={() => setModalÅpen(true)}
            >
                Se detaljer
            </Button>
        </div>
    );
};

const SimuleringsDetaljerModal = (props: { simulering: Simulering; open: boolean; close: () => void }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content>
                <Heading spacing level="2" size="medium">
                    {formatMessage('modal.heading')}
                </Heading>
                <Label className={classNames(styles.totalt, styles.linjeTittel)}>
                    <span>{formatMessage('totaltBeløp')}</span>
                    <span />
                    <span className={styles.beløp}>
                        {formatCurrency(props.simulering.totalBruttoYtelse, { numDecimals: 0 })}
                    </span>
                </Label>

                <ul>
                    {props.simulering.perioder.map((periode) => (
                        <li key={`${periode.fraOgMed} - ${periode.tilOgMed}`}>
                            <CollapsableFormElementDescription
                                className={styles.linje}
                                title={
                                    <div className={styles.linjeTittel}>
                                        <Label className={styles.periode}>
                                            {`${formatMonthYear(periode.fraOgMed)} - ${formatMonthYear(
                                                periode.tilOgMed
                                            )}`}
                                        </Label>
                                        <Label className={styles.type}>
                                            {periode.type !== SimulertUtbetalingstype.ORDINÆR
                                                ? formatMessage(periode.type)
                                                : ''}
                                        </Label>
                                        <Label className={styles.beløp}>
                                            {formatCurrency(periode.bruttoYtelse, { numDecimals: 0 })}{' '}
                                            {formatMessage('iMnd')}
                                        </Label>
                                    </div>
                                }
                            >
                                <div className={styles.simuleringsdetaljerContainer}>
                                    <div>
                                        <Label>Ytelse</Label>
                                        <div className={styles.detalje}>
                                            <p>plus</p>
                                            <p>beløp</p>
                                            <p>minus</p>
                                            <p>beløp</p>
                                            <p>sum</p>
                                            <p>beløp</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Feilkonto</Label>
                                        <div className={styles.detalje}>
                                            <p>plus</p>
                                            <p>beløp</p>
                                            <p>minus</p>
                                            <p>beløp</p>
                                            <p>sum</p>
                                            <p>beløp</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Motpostering for feilkonto</Label>
                                        <div className={styles.detalje}>
                                            <p>plus</p>
                                            <p>beløp</p>
                                            <p>minus</p>
                                            <p>beløp</p>
                                            <p>sum</p>
                                            <p>beløp</p>
                                        </div>
                                    </div>
                                </div>
                            </CollapsableFormElementDescription>
                        </li>
                    ))}
                </ul>
            </Modal.Content>
        </Modal>
    );
};

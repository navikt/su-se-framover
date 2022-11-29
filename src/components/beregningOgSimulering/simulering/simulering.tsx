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

import * as styles from '../beregning/visBeregning.module.less';

import messages from './simulering-nb';

export const VisSimulering = (props: { behandling: Søknadsbehandling }) => {
    if (!props.behandling.simulering) {
        return <div>Behandlingen har ingen simulering</div>;
    }
    return <Utbetalingssimulering simulering={props.behandling.simulering} />;
};

export const Utbetalingssimulering = (props: { simulering: Simulering; utenTittel?: boolean }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className={styles.simuleringsdetaljer}>
            {props.utenTittel && (
                <Heading level="4" size="medium" spacing>
                    {formatMessage('simulering.tittel')}
                </Heading>
            )}
            <Button type="button" onClick={() => setOpen(true)}>
                Vis detaljer
            </Button>
            {open && (
                <SimuleringsDetaljerModal simulering={props.simulering} open={open} close={() => setOpen(false)} />
            )}
            <Label className={classNames(styles.totalt, styles.linje)}>
                <span>{formatMessage('totaltBeløp')}</span>
                <span />
                <span className={styles.beløp}>
                    {formatCurrency(props.simulering.totalBruttoYtelse, { numDecimals: 0 })}
                </span>
            </Label>
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
                            <Label className={styles.linje} key={head.fraOgMed + head.tilOgMed} spacing>
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
                        Option.getOrElse(() => <Alert variant="warning">{formatMessage('feil.manglerPerioder')}</Alert>)
                    )
                )
            )}
        </div>
    );
};

const SimuleringsDetaljerModal = (props: { simulering: Simulering; open: boolean; close: () => void }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content className={styles.simuleringsdetaljer}>
                <Label className={classNames(styles.totalt, styles.linje)}>
                    <span>{formatMessage('totaltBeløp')}</span>
                    <span />
                    <span className={styles.beløp}>
                        {formatCurrency(props.simulering.totalBruttoYtelse, { numDecimals: 0 })}
                    </span>
                </Label>

                {props.simulering.perioder.map((periode) => (
                    <>
                        <CollapsableFormElementDescription
                            title={
                                <Label className={styles.linje} key={`${periode.fraOgMed}.${periode.tilOgMed}`} spacing>
                                    <span className={styles.periode}>{`${formatMonthYear(
                                        periode.fraOgMed
                                    )} - ${formatMonthYear(periode.tilOgMed)}`}</span>
                                    <span className={styles.type}>
                                        {periode.type !== SimulertUtbetalingstype.ORDINÆR
                                            ? formatMessage(periode.type)
                                            : ''}
                                    </span>
                                    <span className={styles.beløp}>
                                        {formatCurrency(periode.bruttoYtelse, { numDecimals: 0 })}{' '}
                                        {formatMessage('iMnd')}
                                    </span>
                                </Label>
                            }
                        >
                            <div className={styles.simuleringsdetaljerNy}>
                                <div>
                                    <Label>Ytelse</Label>
                                    <div className={styles.detaljerAvDetaljer}>
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
                                    <div className={styles.detaljerAvDetaljer}>
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
                                    <div className={styles.detaljerAvDetaljer}>
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
                    </>
                ))}
            </Modal.Content>
        </Modal>
    );
};

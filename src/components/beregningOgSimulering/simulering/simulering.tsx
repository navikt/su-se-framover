import { WarningColored } from '@navikt/ds-icons';
import { Accordion, Alert, Button, Heading, Label, Modal } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import React, { useState } from 'react';

import sharedMessages from '~src/components/beregningOgSimulering/beregning/beregning-nb';
import { OppsummeringPar } from '~src/components/oppsummeringspar/Oppsummeringsverdi';
import { combineOptions, pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { SimuleringsperiodeOppsummering, Simulering } from '~src/types/Simulering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { groupWhile } from '~src/utils/array/arrayUtils';
import { formatMonthYear } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import messages from './simulering-nb';
import * as styles from './Simulering.module.less';

export const VisSimulering = (props: { behandling: Søknadsbehandling }) => {
    const { formatMessage } = useI18n({ messages });
    if (!props.behandling.simulering) {
        return <div>{formatMessage('feil.ingenSimulering')}</div>;
    }
    return <Utbetalingssimulering simulering={props.behandling.simulering} />;
};

export const Utbetalingssimulering = (props: { simulering: Simulering; utenTittel?: boolean }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [modalÅpen, setModalÅpen] = useState<boolean>(false);

    return (
        <div>
            {!props.utenTittel && (
                <Heading level="4" size="medium" spacing>
                    {formatMessage('simulering.tittel')}
                </Heading>
            )}
            <SimulertePerioderMedTotalBruttoYtelse simulering={props.simulering} />
            <Button
                className={styles.detaljerKnapp}
                variant="tertiary"
                type="button"
                onClick={() => setModalÅpen(true)}
            >
                Se detaljer
            </Button>
            {modalÅpen && (
                <SimuleringsDetaljerModal
                    simulering={props.simulering}
                    open={modalÅpen}
                    close={() => setModalÅpen(false)}
                />
            )}
        </div>
    );
};

const SimulertePerioderMedTotalBruttoYtelse = (props: { simulering: Simulering; detaljert?: boolean }) => {
    return (
        <div>
            <SimulertePerioder perioder={props.simulering.periodeOppsummering} detaljert={props.detaljert} />
        </div>
    );
};

const SimuleringsDetaljerModal = (props: { simulering: Simulering; open: boolean; close: () => void }) => {
    const { formatMessage } = useI18n({ messages: messages });
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content>
                <Heading spacing level="2" size="medium">
                    {formatMessage('modal.heading.periode')}
                </Heading>
                <SimulertePerioderMedTotalBruttoYtelse simulering={props.simulering} detaljert />
                <Heading spacing level="2" size="medium">
                    {formatMessage('modal.heading.total')}
                </Heading>
                <DetaljertSimuleringsperioder perioder={[props.simulering.totalOppsummering]} />
            </Modal.Content>
        </Modal>
    );
};

const SimulertePerioder = (props: { perioder: SimuleringsperiodeOppsummering[]; detaljert?: boolean }) => {
    return props.detaljert ? (
        <DetaljertSimuleringsperioder perioder={props.perioder} />
    ) : (
        <GruppertSimuleringsperioder perioder={props.perioder} />
    );
};

const GruppertSimuleringsperioder = (props: { perioder: SimuleringsperiodeOppsummering[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            {pipe(
                props.perioder,
                groupWhile(
                    (curr, prev) =>
                        curr.sumTilUtbetaling === prev.sumTilUtbetaling &&
                        DateFns.differenceInCalendarMonths(
                            DateFns.parseISO(curr.fraOgMed),
                            DateFns.parseISO(prev.tilOgMed)
                        ) <= 1
                ),
                arr.map((gruppe) =>
                    pipe(
                        combineOptions([arr.head(gruppe), arr.last(gruppe)]),
                        Option.map(([first, last]) => (
                            <div key={first.fraOgMed + first.tilOgMed} className={styles.gruppertSimuleringsperioder}>
                                <Label>
                                    {`${formatMonthYear(first.fraOgMed)} - ${formatMonthYear(last.tilOgMed)}`}
                                </Label>
                                <Label className={styles.beløp}>
                                    {formatCurrency(first.sumTilUtbetaling, { numDecimals: 0 })} {formatMessage('iMnd')}
                                </Label>
                            </div>
                        )),
                        Option.getOrElse(() => <Alert variant="warning">{formatMessage('feil.manglerPerioder')}</Alert>)
                    )
                )
            )}
        </div>
    );
};

const DetaljertSimuleringsperioder = (props: { perioder: SimuleringsperiodeOppsummering[] }) => {
    return (
        <Accordion className={styles.accordion}>
            {props.perioder.map((periode) => (
                <DetaljertSimuleringsperiode periode={periode} key={`${periode.fraOgMed} - ${periode.tilOgMed}`} />
            ))}
        </Accordion>
    );
};

const DetaljertSimuleringsperiode = (props: { periode: SimuleringsperiodeOppsummering }) => {
    return (
        <Accordion.Item>
            <Accordion.Header className={styles.accordionHeader}>
                <div className={styles.periodeOgSum}>
                    <Label>
                        {`${formatMonthYear(props.periode.fraOgMed)} - ${formatMonthYear(props.periode.tilOgMed)}`}
                    </Label>
                    <Label className={styles.beløp}>
                        {formatCurrency(props.periode.sumTilUtbetaling, { numDecimals: 0 })}
                    </Label>
                </div>
                {props.periode.sumFeilutbetaling !== 0 || props.periode.sumReduksjonFeilkonto !== 0 ? (
                    <WarningColored />
                ) : undefined}
            </Accordion.Header>
            <Accordion.Content>
                <PeriodeOppsummering oppsummering={props.periode} />
            </Accordion.Content>
        </Accordion.Item>
    );
};

const PeriodeOppsummering = (props: { oppsummering: SimuleringsperiodeOppsummering }) => {
    return (
        <div className={styles.kontooversiktContainer}>
            <OppsummeringYtelse oppsummering={props.oppsummering} />
            <OppsummeringFeilkonto oppsummering={props.oppsummering} />
        </div>
    );
};

const OppsummeringYtelse = (props: { oppsummering: SimuleringsperiodeOppsummering }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.ytelseOppsummering}>
            <Heading size="small" level="1">
                {formatMessage('kontooversikt.tittel.ytelse')}
            </Heading>
            <OppsummeringPar label={'Utbetaling'} verdi={props.oppsummering.sumTotalUtbetaling} />
            <OppsummeringPar label={'Tidligere utbetalt'} verdi={-props.oppsummering.sumTidligereUtbetalt} />
            <hr></hr>
            <OppsummeringPar label={'Til utbetaling'} verdi={props.oppsummering.sumTilUtbetaling} />
            <OppsummeringPar
                textSomSmall={true}
                className={styles.tilUtbetalingDetaljering}
                label={'Etterbetaling'}
                verdi={props.oppsummering.sumEtterbetaling}
            />
            <OppsummeringPar
                textSomSmall={true}
                className={styles.tilUtbetalingDetaljering}
                label={'Fremtidig utbetaling'}
                verdi={props.oppsummering.sumFramtidigUtbetaling}
            />
        </div>
    );
};

const OppsummeringFeilkonto = (props: { oppsummering: SimuleringsperiodeOppsummering }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size="small" level="1">
                {formatMessage('kontooversikt.tittel.feilkonto')}
            </Heading>
            <OppsummeringPar label={'Feilutbetaling'} verdi={props.oppsummering.sumFeilutbetaling} />
            <OppsummeringPar label={'Reduksjon feilkonto'} verdi={-props.oppsummering.sumReduksjonFeilkonto} />
        </div>
    );
};

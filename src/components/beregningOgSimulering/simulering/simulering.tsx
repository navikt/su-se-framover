import { WarningColored } from '@navikt/ds-icons';
import { Alert, BodyShort, Button, Heading, Label, Modal } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import React, { useState } from 'react';

import sharedMessages from '~src/components/beregningOgSimulering/beregning/beregning-nb';
import { CollapsableFormElementDescription } from '~src/components/formElements/FormElements';
import { combineOptions, pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { Kontooversikt, Simulering, SimulertPeriode } from '~src/types/Simulering';
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
    const { formatMessage } = useI18n({ messages: messages });
    return (
        <div>
            <div className={styles.bruttoYtelseContainer}>
                <Label>{formatMessage('totaltBeløp')}</Label>
                <Label className={styles.beløp}>
                    {formatCurrency(props.simulering.totalBruttoYtelse, { numDecimals: 0 })}
                </Label>
            </div>
            <SimulertePerioder perioder={props.simulering.perioder} detaljert={props.detaljert} />
        </div>
    );
};

const SimuleringsDetaljerModal = (props: { simulering: Simulering; open: boolean; close: () => void }) => {
    const { formatMessage } = useI18n({ messages: messages });
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content>
                <Heading spacing level="2" size="medium">
                    {formatMessage('modal.heading')}
                </Heading>
                <SimulertePerioderMedTotalBruttoYtelse simulering={props.simulering} detaljert />
            </Modal.Content>
        </Modal>
    );
};

const SimulertePerioder = (props: { perioder: SimulertPeriode[]; detaljert?: boolean }) => {
    return props.detaljert ? (
        <DetaljertSimuleringsperioder perioder={props.perioder} />
    ) : (
        <GruppertSimuleringsperioder perioder={props.perioder} />
    );
};

const GruppertSimuleringsperioder = (props: { perioder: SimulertPeriode[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            {pipe(
                props.perioder,
                groupWhile(
                    (curr, prev) =>
                        curr.kontooppstilling.sumYtelse === prev.kontooppstilling.sumYtelse &&
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
                                    {formatCurrency(first.kontooppstilling.sumYtelse, { numDecimals: 0 })}{' '}
                                    {formatMessage('iMnd')}
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

const DetaljertSimuleringsperioder = (props: { perioder: SimulertPeriode[] }) => (
    <ul>
        {props.perioder.map((periode) => (
            <li key={`${periode.fraOgMed} - ${periode.tilOgMed}`}>
                <DetaljertSimuleringsperiode periode={periode} />
            </li>
        ))}
    </ul>
);

const DetaljertSimuleringsperiode = (props: { periode: SimulertPeriode }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <CollapsableFormElementDescription
            title={
                <div className={styles.collapsableTittel}>
                    <Label>
                        {`${formatMonthYear(props.periode.fraOgMed)} - ${formatMonthYear(props.periode.tilOgMed)}`}
                    </Label>
                    <Label className={styles.beløp}>
                        {formatCurrency(props.periode.kontooppstilling.sumYtelse, { numDecimals: 0 })}{' '}
                        {formatMessage('iMnd')}
                    </Label>
                </div>
            }
            elementerEtterTittel={
                props.periode.kontooppstilling.sumFeilkonto !== 0 ||
                props.periode.kontooppstilling.sumMotpostFeilkonto !== 0 ? (
                    <WarningColored />
                ) : undefined
            }
        >
            <KontooversiktSimuleringsperiode kontooversikt={props.periode.kontooppstilling} />
        </CollapsableFormElementDescription>
    );
};

const KontooversiktSimuleringsperiode = (props: { kontooversikt: Kontooversikt }) => {
    return (
        <div className={styles.kontooversiktContainer}>
            <KontooversiktInformasjon kontooversikt={props.kontooversikt} type={'ytelse'} />
            <KontooversiktInformasjon kontooversikt={props.kontooversikt} type={'feilkonto'} />
            <KontooversiktInformasjon kontooversikt={props.kontooversikt} type={'motpostering'} />
        </div>
    );
};

const KontooversiktInformasjon = (props: {
    kontooversikt: Kontooversikt;
    type: 'ytelse' | 'feilkonto' | 'motpostering';
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Label>{formatMessage(`kontooversikt.tittel.${props.type}`)}</Label>
            <div className={styles.kontooversiktInfo}>
                <BodyShort>{formatMessage('kontooversikt.info.debet')}</BodyShort>
                <BodyShort className={styles.beløp}>
                    {props.type === 'ytelse'
                        ? props.kontooversikt.debetYtelse
                        : props.type === 'feilkonto'
                        ? props.kontooversikt.debetFeilkonto
                        : props.type === 'motpostering'
                        ? props.kontooversikt.debetMotpostFeilkonto
                        : 'Ukjent debet type'}
                </BodyShort>
                <BodyShort>{formatMessage('kontooversikt.info.kredit')}</BodyShort>
                <BodyShort className={styles.beløp}>
                    {props.type === 'ytelse'
                        ? props.kontooversikt.kreditYtelse
                        : props.type === 'feilkonto'
                        ? props.kontooversikt.kreditFeilkonto
                        : props.type === 'motpostering'
                        ? props.kontooversikt.kreditMotpostFeilkonto
                        : 'Ukjent kredit type'}
                </BodyShort>
                <BodyShort>{formatMessage('kontooversikt.info.sum')}</BodyShort>
                <BodyShort className={styles.beløp}>
                    {props.type === 'ytelse'
                        ? props.kontooversikt.sumYtelse
                        : props.type === 'feilkonto'
                        ? props.kontooversikt.sumFeilkonto
                        : props.type === 'motpostering'
                        ? props.kontooversikt.sumMotpostFeilkonto
                        : 'Ukjent sum type'}
                </BodyShort>
            </div>
        </div>
    );
};

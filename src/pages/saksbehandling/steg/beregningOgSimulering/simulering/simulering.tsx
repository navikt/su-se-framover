import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Systemtittel, Element } from 'nav-frontend-typografi';
import React from 'react';

import { formatMonthYear } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregning-nb';
import { useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Simulering } from '~types/Simulering';

import { groupSimuleringsperioder } from '../../../delt/arrayUtils';
import styles from '../beregning/visBeregning.module.less';

interface Props {
    sak: Sak;
    behandling: Behandling;
}

const Utbetalingssimulering = (props: { simulering: Simulering }) => {
    const intl = useI18n({ messages });
    const gruppertSimuleringsperioder = groupSimuleringsperioder(props.simulering.perioder);

    return (
        <div className={styles.beregningdetaljer}>
            <Systemtittel className={styles.visBeregningTittel}>
                {intl.formatMessage({ id: 'simulering.tittel' })}
            </Systemtittel>
            <Element className={classNames(styles.totalt, styles.linje)}>
                <span>Totalt beløp</span>
                <span>
                    {formatCurrency(
                        intl,
                        props.simulering.perioder.reduce((acc, val) => acc + val.bruttoYtelse, 0),
                        {
                            numDecimals: 0,
                        }
                    )}
                </span>
            </Element>
            {gruppertSimuleringsperioder.map((gruppe) => {
                return pipe(
                    combineOptions(arr.head(gruppe), arr.last(gruppe)),
                    Option.fold(
                        () => ({
                            tittel: '?',
                            beløp: 0,
                        }),
                        ([head, last]) => ({
                            tittel: `${formatMonthYear(head.fraOgMed, intl)} - ${formatMonthYear(last.tilOgMed, intl)}`,
                            beløp: head.bruttoYtelse,
                        })
                    ),
                    ({ tittel, beløp }) => (
                        <Element tag="h3" className={classNames(styles.periodeoverskrift, styles.linje)}>
                            <span>{tittel}</span>
                            <span>
                                {formatCurrency(intl, beløp, {
                                    numDecimals: 0,
                                })}{' '}
                                i mnd
                            </span>
                        </Element>
                    )
                );
            })}
        </div>
    );
};

export const VisSimulering = (props: Props) => {
    const { behandling } = props;

    const simuleringStatus = useAppSelector((s) => s.sak.simuleringStatus);
    if (RemoteData.isFailure(simuleringStatus)) {
        return <div>Feilet mens vi hentet oppdrag/simulering</div>;
    } else if (RemoteData.isPending(simuleringStatus)) {
        return <NavFrontendSpinner />;
    }
    if (!behandling.simulering) {
        return <div>Behandlingen har ingen simulering</div>;
    }
    return <Utbetalingssimulering simulering={behandling.simulering} />;
};

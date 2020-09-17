import * as RemoteData from '@devexperts/remote-data-ts';
import * as arr from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import messages from '~/features/beregning/beregning-nb';
import { formatDateTime } from '~lib/dateUtils';
import { combineOptions } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { Utbetaling } from '~types/Utbetaling';

import styles from '../beregning/visBeregning.module.less';
import { groupSimuleringsperioder } from '../delt/arrayUtils';
import { InfoLinje } from '../delt/Infolinje/Infolinje';

interface Props {
    sak: Sak;
    behandlingId: string;
}

const Utbetalingssimulering = (props: { utbetaling: Utbetaling }) => {
    const intl = useI18n({ messages });
    const gruppertSimuleringsperioder = groupSimuleringsperioder(props.utbetaling.simulering.perioder);

    return (
        <>
            <Innholdstittel className={styles.tittel}>Simulering:</Innholdstittel>
            <div className={styles.grunndata}>
                <InfoLinje tittel={'id:'} value={props.utbetaling.id} />
                <InfoLinje tittel={'opprettet:'} value={formatDateTime(props.utbetaling.opprettet, intl)} />
                <InfoLinje
                    tittel="Totalbeløp:"
                    value={intl.formatNumber(props.utbetaling.simulering.totalBruttoYtelse, { currency: 'NOK' })}
                />
            </div>
            {props.utbetaling.simulering.perioder && (
                <table className="tabell">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Brutto beløp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gruppertSimuleringsperioder.map((gruppe) => {
                            return pipe(
                                combineOptions(arr.head(gruppe), arr.last(gruppe)),
                                Option.fold(
                                    () => null,
                                    ([head, last]) => (
                                        <tr key={head.fom + last.tom}>
                                            <td>{`${intl.formatDate(head.fom)} - ${intl.formatDate(last.tom)}`}</td>
                                            <td>{head.bruttoYtelse}</td>
                                        </tr>
                                    )
                                )
                            );
                        })}
                        <p className={styles.totalBeløp}>
                            Totalbeløp: {intl.formatNumber(props.utbetaling.simulering.totalBruttoYtelse)},-
                        </p>
                    </tbody>
                </table>
            )}
        </>
    );
};

export const Simulering = (props: Props) => {
    const { sak, behandlingId } = props;

    const simuleringStatus = useAppSelector((s) => s.sak.simuleringStatus);
    if (RemoteData.isFailure(simuleringStatus)) {
        return <div>Feilet mens vi hentet oppdrag/simulering</div>;
    } else if (RemoteData.isPending(simuleringStatus)) {
        return <NavFrontendSpinner />;
    }
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling || !behandling.utbetaling) {
        return <div>Behandlingen har ingen oppdrag</div>;
    }
    return <Utbetalingssimulering utbetaling={behandling.utbetaling} />;
};

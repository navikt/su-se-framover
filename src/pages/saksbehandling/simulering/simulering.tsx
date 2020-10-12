import * as RemoteData from '@devexperts/remote-data-ts';
import * as arr from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import { formatDateTime } from '~lib/dateUtils';
import { combineOptions } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregning/beregning-nb';
import { useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Simulering } from '~types/Simulering';

import { groupSimuleringsperioder } from '../delt/arrayUtils';
import { InfoLinje } from '../delt/Infolinje/Infolinje';
import styles from '../steg/beregning/visBeregning.module.less';

interface Props {
    sak: Sak;
    behandling: Behandling;
}

const Utbetalingssimulering = (props: { simulering: Simulering }) => {
    const intl = useI18n({ messages });
    const gruppertSimuleringsperioder = groupSimuleringsperioder(props.simulering.perioder);

    return (
        <>
            <Innholdstittel className={styles.tittel}>Simulering:</Innholdstittel>
            <div className={styles.grunndata}>
                <InfoLinje tittel={'id:'} value={props.simulering.utbetalingId} />
                <InfoLinje tittel={'opprettet:'} value={formatDateTime(props.simulering.opprettet, intl)} />
                <InfoLinje
                    tittel="Totalbeløp:"
                    value={intl.formatNumber(props.simulering.totalBruttoYtelse, { currency: 'NOK' })}
                />
            </div>
            {props.simulering.perioder && (
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
                                        <tr key={head.fraOgMed + last.tilOgMed}>
                                            <td>{`${intl.formatDate(head.fraOgMed)} - ${intl.formatDate(
                                                last.tilOgMed
                                            )}`}</td>
                                            <td>{head.bruttoYtelse}</td>
                                        </tr>
                                    )
                                )
                            );
                        })}
                        <p className={styles.totalBeløp}>
                            Totalbeløp: {intl.formatNumber(props.simulering.totalBruttoYtelse)},-
                        </p>
                    </tbody>
                </table>
            )}
        </>
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

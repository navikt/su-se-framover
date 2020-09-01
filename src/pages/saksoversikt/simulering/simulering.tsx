import * as RemoteData from '@devexperts/remote-data-ts';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import { Utbetaling } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { useAppSelector } from '~redux/Store';

import messages from '../beregning/beregning-nb';
import styles from '../beregning/visBeregning.module.less';
import { InfoLinje } from '../delt/Infolinje/Infolinje';

interface Props {
    sak: Sak;
    behandlingId: string;
}

const Utbetalingssimulering = (props: { utbetaling: Utbetaling }) => {
    const intl = useI18n({ messages });
    return (
        <>
            <Innholdstittel className={styles.tittel}>Simulering:</Innholdstittel>
            <div className={styles.grunndata}>
                <InfoLinje tittel={'id:'} value={props.utbetaling.id} />
                <InfoLinje tittel={'opprettet:'} value={formatDateTime(props.utbetaling.opprettet, intl)} />
                <InfoLinje tittel={'brutto:'} value={props.utbetaling.simulering.totalBruttoYtelse} />
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
                        {props.utbetaling.simulering.perioder.map((periode, index) => (
                            <tr key={index}>
                                <td>{`${intl.formatDate(periode.fom)} - ${intl.formatDate(periode.tom)}`}</td>
                                <td>{periode.bruttoYtelse}</td>
                            </tr>
                        ))}
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

import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import { Beregning } from '~api/behandlingApi';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';

import messages from './beregning-nb';
import styles from './beregning.module.less';

interface Props {
    beregning: Beregning;
}

const InfoLinje = (props: { tittel: string; value: string | number }) => (
    <div className={styles.infolinje}>
        <span>{props.tittel}</span>
        <span>{props.value}</span>
    </div>
);

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    return (
        <div className={styles.visBeregning}>
            <Innholdstittel>Beregning:</Innholdstittel>
            <InfoLinje tittel={'id:'} value={beregning.id} />
            <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
            <InfoLinje tittel={'sats:'} value={beregning.sats} />
            <InfoLinje tittel={'Startdato:'} value={intl.formatDate(beregning.fom)} />
            <InfoLinje tittel={'Sluttdato:'} value={intl.formatDate(beregning.tom)} />
            <InfoLinje tittel="Totalbeløp:" value={intl.formatNumber(totalbeløp, { currency: 'NOK' })} />
            <table className="tabell">
                <thead>
                    <th></th>
                    <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.beløp' })}</th>
                    <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.grunnbeløp' })}</th>
                </thead>
                <tbody>
                    {beregning.månedsberegninger.map((beregning) => (
                        <tr key={beregning.id}>
                            <td>{`${intl.formatDate(beregning.fom)} - ${intl.formatDate(beregning.tom)}`}</td>
                            <td>{beregning.beløp}</td>
                            <td>{beregning.grunnbeløp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default VisBeregning;

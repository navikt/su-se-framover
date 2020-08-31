import { Innholdstittel, Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';

import { Beregning } from '~api/behandlingApi';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';

import messages from './beregning-nb';
import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
}

export const InfoLinje = (props: { tittel: string; value: string | number }) => (
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
        <div>
            <Innholdstittel className={styles.tittel}>Beregning:</Innholdstittel>
            <div className={styles.grunndata}>
                <InfoLinje tittel={'id:'} value={beregning.id} />
                <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
                <InfoLinje tittel={'sats:'} value={beregning.sats} />
                <InfoLinje tittel={'Startdato:'} value={intl.formatDate(beregning.fom)} />
                <InfoLinje tittel={'Sluttdato:'} value={intl.formatDate(beregning.tom)} />
                <InfoLinje tittel="Totalbeløp:" value={intl.formatNumber(totalbeløp, { currency: 'NOK' })} />
            </div>
            {beregning.fradrag.length > 0 && (
                <div>
                    <Element className={styles.fradragHeading}>Fradrag:</Element>
                    <ul>
                        {beregning.fradrag.map((f, idx) => (
                            <li key={idx} className={styles.fradragItem}>
                                <InfoLinje tittel={f.type} value={intl.formatNumber(f.beløp, { currency: 'NOK' })} />
                                {f.beskrivelse && (
                                    <Undertekst className={styles.fradragKommentar}>{f.beskrivelse}</Undertekst>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <table className="tabell">
                <thead>
                    <tr>
                        <th></th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.beløp' })}</th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.grunnbeløp' })}</th>
                    </tr>
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

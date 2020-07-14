import React from 'react';
import { Beregning } from '~api/behandlingApi';
import { Innholdstittel } from 'nav-frontend-typografi';
import styles from './beregning.module.less';
import { useI18n } from '~lib/hooks';
import { formatDateTime } from '~lib/dateUtils';
import messages from './beregning-nb';

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
    return (
        <div className={styles.visBeregning}>
            <Innholdstittel>Beregning:</Innholdstittel>
            <InfoLinje tittel={'id:'} value={beregning.id} />
            <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
            <InfoLinje tittel={'sats:'} value={beregning.sats} />
            <InfoLinje tittel={'Start dato:'} value={intl.formatDate(beregning.fom)} />
            <InfoLinje tittel={'Slutt dato:'} value={intl.formatDate(beregning.tom)} />
            {beregning.månedsberegninger.map((beregning) => (
                <div key={beregning.id}>
                    <InfoLinje tittel={'id: '} value={beregning.id} />
                    <InfoLinje tittel={'sats: '} value={beregning.sats} />
                    <InfoLinje
                        tittel={`${intl.formatDate(beregning.fom)} - ${intl.formatDate(beregning.tom)}`}
                        value={beregning.beløp}
                    />
                </div>
            ))}
        </div>
    );
};
export default VisBeregning;

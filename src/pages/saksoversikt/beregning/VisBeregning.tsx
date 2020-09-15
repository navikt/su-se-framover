import * as arr from 'fp-ts/es6/Array';
import { Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';

import { Beregning, Månedsberegning } from '~api/behandlingApi';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';

import { InfoLinje } from '../delt/Infolinje/Infolinje';

import messages from './beregning-nb';
import styles from './visBeregning.module.less';

const groupMånedsberegninger = (månedsberegninger: Array<Månedsberegning>) => {
    return månedsberegninger.reduce(
        (groups, månedsberegning, index) => {
            if (index === 0) {
                return [[månedsberegning]];
            }

            if (månedsberegning.beløp === månedsberegninger[index - 1].beløp) {
                const init = groups.slice(0, groups.length - 1);

                return [...init, [...groups[groups.length - 1], månedsberegning]];
            }

            return [...groups, [månedsberegning]];
        },
        [[]] as Array<Array<Månedsberegning>>
    );
};

interface Props {
    beregning: Beregning;
}

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);

    return (
        <div>
            <div className={styles.grunndata}>
                <InfoLinje tittel={'opprettet:'} value={formatDateTime(beregning.opprettet, intl)} />
                <InfoLinje tittel={'sats:'} value={beregning.sats} />
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
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.periode' })}</th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.beløp' })}</th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.grunnbeløp' })}</th>
                    </tr>
                </thead>
                <tbody>
                    {gruppertMånedsberegninger.map((gruppe) => {
                        pipe(
                        	combineOptions(Arr.head(gruppe), Arr.last(gruppe)),
                        	Option.fold(
                        		() => null,
                        		([head, last]) => (
	                        		<tr key={beregning.id}>
	                                <td>{`${intl.formatDate(head.value.fom)} - ${intl.formatDate(last.value.tom)}`}</td>
	                                <td>{head.value.beløp}</td>
	                                <td>{head.value.grunnbeløp}</td>
	                            </tr>
                        		)
                        	)
                        );
                    })}
                </tbody>
            </table>
            <p className={styles.totalBeløp}>Totalbeløp: {intl.formatNumber(totalbeløp)},-</p>
        </div>
    );
};
export default VisBeregning;

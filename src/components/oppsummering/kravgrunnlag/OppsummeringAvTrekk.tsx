import { BodyShort, Heading } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Grunnlagsperiode } from '~src/types/Kravgrunnlag';
import { formatCurrency } from '~src/utils/format/formatUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './OppsummeringAvTrekk.module.less';
import messages from './OppsummeringAvTrekk-nb';

const tallformat = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });
const formatKroner = (beløp: number) => `${tallformat.format(beløp)} kroner`;

const OppsummeringAvTrekk = (props: { grunnlagsperiode: Grunnlagsperiode }) => {
    const { formatMessage } = useI18n({ messages });
    const trekkMedBeløp = props.grunnlagsperiode.trekk.flatMap((trekk) => {
        const justering = Number(trekk.justeringAvBruttoFeilutbetaling);
        return Number.isFinite(justering) && trekk.justeringAvBruttoFeilutbetaling.trim() !== ''
            ? [{ trekk, justering }]
            : [];
    });

    if (props.grunnlagsperiode.trekk.length === 0) {
        return null;
    }

    const bruttoFeilutbetaling = Number(props.grunnlagsperiode.bruttoFeilutbetaling);
    if (
        trekkMedBeløp.length !== props.grunnlagsperiode.trekk.length ||
        !Number.isFinite(bruttoFeilutbetaling) ||
        props.grunnlagsperiode.bruttoFeilutbetaling.trim() === ''
    ) {
        return (
            <section className={styles.trekkOppsummering}>
                <Heading size="xsmall">{formatMessage('trekk.tittel')}</Heading>
                <BodyShort>{formatMessage('trekk.feil')}</BodyShort>
            </section>
        );
    }

    const justeringSummert = trekkMedBeløp.reduce((sum, { justering }) => sum + justering, 0);
    const trekkBeløpSummert = trekkMedBeløp.reduce((sum, { justering }) => sum + Math.abs(justering), 0);
    const bruttoFørTrekk = bruttoFeilutbetaling - justeringSummert;

    return (
        <section className={styles.trekkOppsummering}>
            <Heading size="xsmall">{formatMessage('trekk.tittel')}</Heading>
            <ul className={styles.trekkListe}>
                {trekkMedBeløp.map(({ trekk, justering }, index) => (
                    <li key={`${trekk.kodeKlasse}-${index}`}>
                        <OppsummeringPar
                            label={formatMessage('trekk.linje', { kodeKlasse: trekk.kodeKlasse })}
                            verdi={formatCurrency(justering, { numDecimals: 0 })}
                        />
                    </li>
                ))}
            </ul>
            <BodyShort>
                {formatMessage(trekkMedBeløp.length === 1 ? 'trekk.forklaring.entall' : 'trekk.forklaring.flertall', {
                    trekkBeløp: formatKroner(trekkBeløpSummert),
                    bruttoFørTrekk: formatKroner(bruttoFørTrekk),
                    bruttoEtterTrekk: formatKroner(bruttoFeilutbetaling),
                })}
            </BodyShort>
        </section>
    );
};

export default OppsummeringAvTrekk;

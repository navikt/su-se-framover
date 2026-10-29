import { BodyShort, Label } from '@navikt/ds-react';
import { HistoriskInfotrygdMånedsgrunnlagForMåned } from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { fradragskoderForVisning } from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';

interface Props {
    vedtaksgrunnlag: HistoriskInfotrygdMånedsgrunnlagForMåned;
}

const HistoriskInfotrygdVedtaksgrunnlag = ({ vedtaksgrunnlag }: Props) => (
    <dl className={styles.detaljer}>
        <div>
            <Label as="dt" size="small">
                Kilde for vedtaket som revurderes
            </Label>
            <BodyShort as="dd">
                {vedtaksgrunnlag.kilde.type === 'INFOTRYGD'
                    ? 'Opprinnelig Infotrygd-vedtak'
                    : 'Tidligere historisk revurderingsvedtak i SU-appen'}
            </BodyShort>
        </div>
        {vedtaksgrunnlag.resultat === 'INGEN_YTELSE' ? (
            <div>
                <Label as="dt" size="small">
                    Resultat før revurderingen
                </Label>
                <BodyShort as="dd">Ingen ytelse</BodyShort>
            </div>
        ) : (
            <>
                <div>
                    <Label as="dt" size="small">
                        Sats før revurderingen
                    </Label>
                    <BodyShort as="dd">{formatCurrency(vedtaksgrunnlag.sats)}</BodyShort>
                </div>
                <div>
                    <Label as="dt" size="small">
                        Samlet fradrag før revurderingen
                    </Label>
                    <BodyShort as="dd">{formatCurrency(vedtaksgrunnlag.samletFradrag)}</BodyShort>
                </div>
                <div>
                    <Label as="dt" size="small">
                        Ytelsesbeløp før revurderingen
                    </Label>
                    <BodyShort as="dd">{formatCurrency(vedtaksgrunnlag.ytelsesbeløp)}</BodyShort>
                </div>
                {vedtaksgrunnlag.kilde.type === 'INFOTRYGD' ? (
                    vedtaksgrunnlag.kilde.fradragskoder.length > 0 && (
                        <div>
                            <Label as="dt" size="small">
                                Fradragskoder fra Infotrygd
                            </Label>
                            <dd>
                                <ul className={styles.kodeliste}>
                                    {fradragskoderForVisning(vedtaksgrunnlag.kilde.fradragskoder).map((kode, index) => (
                                        <li key={`${kode}-${index}`}>
                                            <BodyShort size="small">{kode}</BodyShort>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    )
                ) : (
                    <div>
                        <Label as="dt" size="small">
                            Fradrag i tidligere historisk revurderingsvedtak
                        </Label>
                        <dd>
                            {vedtaksgrunnlag.kilde.fradrag.length > 0 ? (
                                <ul className={styles.kodeliste}>
                                    {vedtaksgrunnlag.kilde.fradrag.map((fradrag, index) => (
                                        <li key={`${fradrag.type}-${index}`}>
                                            <BodyShort size="small">
                                                {fradrag.type}
                                                {fradrag.beskrivelse ? ` (${fradrag.beskrivelse})` : ''}:{' '}
                                                {formatCurrency(fradrag.månedsbeløp)}{' '}
                                                {fradrag.tilhører === 'EPS'
                                                    ? '(ektefelle, partner eller samboer)'
                                                    : '(brukeren)'}
                                            </BodyShort>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <BodyShort>Ingen registrerte fradrag</BodyShort>
                            )}
                        </dd>
                    </div>
                )}
            </>
        )}
    </dl>
);

export default HistoriskInfotrygdVedtaksgrunnlag;

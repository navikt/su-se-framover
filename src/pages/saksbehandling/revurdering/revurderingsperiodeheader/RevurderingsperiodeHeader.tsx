import { BodyShort, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Periode } from '~src/types/Periode';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import styles from './revurderingsperiodeheader.module.less';
import messages from './revurderingsperiodeheader-nb';

const RevurderingsperiodeHeader = (props: { periode: Periode<string> }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <BodyShort>{formatMessage('heading')}:</BodyShort>
            <Label>{formatPeriode(props.periode)}</Label>
        </div>
    );
};

export default RevurderingsperiodeHeader;

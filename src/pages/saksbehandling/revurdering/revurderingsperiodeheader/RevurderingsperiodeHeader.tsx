import { BodyShort, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';

import messages from './revurderingsperiodeheader-nb';
import styles from './revurderingsperiodeheader.module.less';

const RevurderingsperiodeHeader = (props: { periode: Periode<string> }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <BodyShort>{formatMessage('heading')}:</BodyShort>
            <Label>{DateUtils.formatPeriode(props.periode)}</Label>
        </div>
    );
};

export default RevurderingsperiodeHeader;

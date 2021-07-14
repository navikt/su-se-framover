import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import { useI18n } from '~lib/hooks';
import { Periode } from '~types/Periode';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './revurderingsperiodeheader-nb';
import styles from './revurderingsperiodeheader.module.less';

const RevurderingsperiodeHeader = (props: { periode: Periode<string> }) => {
    const { intl } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <Systemtittel className={styles.tittel}>{intl.formatMessage({ id: 'heading' })}</Systemtittel>
            <Undertittel>
                {DateUtils.formatMonthYear(props.periode.fraOgMed)}
                {' – '}
                {DateUtils.formatMonthYear(props.periode.tilOgMed)}
            </Undertittel>
        </div>
    );
};

export default RevurderingsperiodeHeader;

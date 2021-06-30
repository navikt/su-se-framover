import { Systemtittel, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { Periode } from '~types/Periode';

import messages from './revurderingsperiodeheader-nb';
import styles from './revurderingsperiodeheader.module.less';

const RevurderingsperiodeHeader = (props: { periode: Periode<string> }) => {
    const { intl } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <Systemtittel className={styles.tittel}>{intl.formatMessage({ id: 'heading' })}</Systemtittel>
            <Undertittel>
                {DateUtils.formatMonthYear(props.periode.fraOgMed, intl)}
                {' – '}
                {DateUtils.formatMonthYear(props.periode.tilOgMed, intl)}
            </Undertittel>
        </div>
    );
};

export default RevurderingsperiodeHeader;

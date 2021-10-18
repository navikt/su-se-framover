import { Heading, Ingress } from '@navikt/ds-react';
import * as React from 'react';

import { useI18n } from '~lib/i18n';
import { Periode } from '~types/Periode';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './revurderingsperiodeheader-nb';
import styles from './revurderingsperiodeheader.module.less';

const RevurderingsperiodeHeader = (props: { periode: Periode<string> }) => {
    const { intl } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <Heading level="2" size="large" spacing>
                {intl.formatMessage({ id: 'heading' })}
            </Heading>
            <Ingress>{DateUtils.formatPeriode(props.periode)}</Ingress>
        </div>
    );
};

export default RevurderingsperiodeHeader;

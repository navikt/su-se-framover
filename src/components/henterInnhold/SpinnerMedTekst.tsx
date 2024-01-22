import { Heading, Loader } from '@navikt/ds-react';
import classNames from 'classnames';

import { useI18n } from '~src/lib/i18n';

import messages from './spinnerMedTekst-nb';
import styles from './spinnerMedTekst.module.less';

const SpinnerMedTekst = (props: { className?: string; text?: string }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={classNames(styles.spinnerMedTekstContainer, props.className)}>
            <Loader size="3xlarge" title={props.text ?? formatMessage('spinner.laster')} />
            <Heading level="3" size="medium">
                {props.text ?? formatMessage('spinner.laster')}
            </Heading>
        </div>
    );
};

export default SpinnerMedTekst;

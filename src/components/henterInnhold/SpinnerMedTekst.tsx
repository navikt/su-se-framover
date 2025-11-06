import { Heading, Loader } from '@navikt/ds-react';
import classNames from 'classnames';

import { useI18n } from '~src/lib/i18n';
import styles from './spinnerMedTekst.module.less';
import messages from './spinnerMedTekst-nb';

const SpinnerMedTekst = (props: {
    className?: string;
    size?: 'small' | '3xlarge' | '2xlarge' | 'xlarge' | 'large' | 'medium' | 'xsmall' | undefined;
    text?: string;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={classNames(styles.spinnerMedTekstContainer, props.className)}>
            <Loader size={'large'} title={props.text ?? formatMessage('spinner.laster')} />
            <Heading
                level={
                    props.size === 'xlarge' ? '1' : props.size === 'large' ? '2' : props.size === 'medium' ? '3' : '4'
                }
                size={
                    props.size === 'xlarge'
                        ? 'xlarge'
                        : props.size === 'large'
                          ? 'large'
                          : props.size === 'medium'
                            ? 'small'
                            : 'small'
                }
            >
                {props.text ?? formatMessage('spinner.laster')}
            </Heading>
        </div>
    );
};

export default SpinnerMedTekst;

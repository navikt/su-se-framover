import { Alert, BodyShort } from '@navikt/ds-react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import styles from './notatPanel.module.less';

type Props = {
    successMessage: string | null;
    actionError: ApiError | null;
    notatError: ApiError | null;
};

const NotatFeedback = (props: Props) => {
    return (
        <>
            {props.successMessage && (
                <Alert variant="success" size="small" contentMaxWidth={false} className={styles.feedbackBox}>
                    <BodyShort>{props.successMessage}</BodyShort>
                </Alert>
            )}
            {props.actionError && (
                <ApiErrorAlert error={props.actionError} className={styles.feedbackBox} size="small" />
            )}
            {props.notatError && <ApiErrorAlert error={props.notatError} className={styles.feedbackBox} size="small" />}
        </>
    );
};

export default NotatFeedback;

import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { pipe } from '~src/lib/fp';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';

import messages from './sharedI18n-nb';

const EksisterendeVedtaksinformasjon = (props: {
    eksisterendeVedtaksinformasjon: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    onSuccess: (data: EksisterendeVedtaksinformasjonTidligerePeriodeResponse) => React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            {pipe(
                props.eksisterendeVedtaksinformasjon,
                RemoteData.fold(
                    () => null,
                    () => (
                        <SpinnerMedTekst text={formatMessage('spinner.henterEksisterendeInformasjon')} size="medium" />
                    ),
                    (error) => {
                        if (error.statusCode === 404) {
                            return <ApiErrorAlert error={error} variant="info" />;
                        }
                        return <ApiErrorAlert error={error} />;
                    },
                    (data) => (
                        <div>
                            <Heading size="small">{formatMessage('eksisterendeInformasjon.heading')}</Heading>
                            {props.onSuccess(data)}
                        </div>
                    ),
                ),
            )}
        </div>
    );
};

export default EksisterendeVedtaksinformasjon;

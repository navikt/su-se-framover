import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { IntlShape } from 'react-intl';

import { hentTidligereGrunnlagsdataForVedtak } from '~api/revurderingApi';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';
import { InformasjonsRevurdering } from '~types/Revurdering';

const RevurderingsoppsummeringWithSnapshot = (props: {
    revurdering: InformasjonsRevurdering;
    sakId: string;
    vedtakId: string;
    intl: IntlShape;
}) => {
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);

    useEffect(() => {
        hentRevurderingSnapshot({ sakId: props.sakId, vedtakId: props.vedtakId });
    }, []);

    return (
        <div>
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => (
                        <Alert variant="error">
                            {error?.body?.message ?? props.intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </Alert>
                    ),
                    (snapshot) => (
                        <Revurderingoppsummering
                            revurdering={props.revurdering}
                            forrigeGrunnlagsdataOgVilkårsvurderinger={snapshot}
                        />
                    )
                )
            )}
        </div>
    );
};

export default RevurderingsoppsummeringWithSnapshot;

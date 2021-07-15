import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect } from 'react';
import { IntlShape } from 'react-intl';

import { hentTidligereGrunnlagsdataForVedtak } from '~api/revurderingApi';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';
import { Revurdering } from '~types/Revurdering';

const RevurderingsoppsummeringWithSnapshot = (props: {
    revurdering: Revurdering;
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
                    () => <NavFrontendSpinner />,
                    () => <NavFrontendSpinner />,
                    (error) => (
                        <AlertStripeFeil>
                            {error?.body?.message ?? props.intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </AlertStripeFeil>
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

import * as RemoteData from '@devexperts/remote-data-ts';
import { Label, Radio } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';

import { ApiError } from '~api/apiClient';
import { RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

interface FormData {
    skalForhåndsvarsle: boolean;
}

const EtterForhåndsvarsel = (props: { revurdering: SimulertRevurdering; intl: IntlShape }) => {
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);

    const form = useForm<FormData>({
        defaultValues: {},
        // resolver: yupResolver(schema),
    });

    return <div>hei hei</div>;
};

export default EtterForhåndsvarsel;

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, TextField } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import * as klageApi from '~api/klageApi';
import { useApiCall } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useRouteParams } from '~lib/routes';
import yup from '~lib/validering';

interface FormData {
    journalpostId: string;
}
const schema = yup.object<FormData>({
    journalpostId: yup.string().trim().required(),
});

const OpprettKlage = () => {
    const urlParams = useRouteParams<typeof Routes.klageRoute>();
    const [, opprettKlage] = useApiCall(klageApi.opprettKlage);
    const { handleSubmit, register, formState } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            journalpostId: '',
        },
    });

    return (
        <form
            onSubmit={handleSubmit((values) =>
                opprettKlage({
                    sakId: urlParams.sakId,
                    journalpostId: values.journalpostId,
                })
            )}
        >
            <TextField
                {...register('journalpostId')}
                error={formState.errors.journalpostId?.message}
                label="JournalpostId"
            />
            <Button>Opprett Klage</Button>
        </form>
    );
};

export default OpprettKlage;

import * as RemoteData from '@devexperts/remote-data-ts';
import { Modal, Heading, Select, Button, BodyShort } from '@navikt/ds-react';
import { FormProvider, useForm, Controller } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import { OmgjøringsGrunn, OmgjøringsÅrsak, OpprettetRevurderingGrunn } from '~src/types/Revurdering.ts';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling.ts';

import messages from './omgjøringsmodal-nb.ts';

export interface Omgjøringsfom {
    omgjøringsårsak: OpprettetRevurderingGrunn;
    omgjøringGrunn: OmgjøringsGrunn;
}

export const OmgjøringModal = ({
    åpenModal,
    setÅpenModal,
    startNyBehandling,
    startNysøknadsbehandlingStatus,
}: {
    åpenModal: boolean;
    setÅpenModal: (åpen: boolean) => void;
    startNyBehandling: (formdata: Omgjøringsfom) => void;
    startNysøknadsbehandlingStatus: ApiResult<Søknadsbehandling>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const form = useForm<Omgjøringsfom>({});
    const { handleSubmit } = form;
    const onSubmit = (formdata: Omgjøringsfom) => {
        startNyBehandling(formdata);
    };
    return (
        <Modal open={åpenModal} onClose={() => setÅpenModal(false)} aria-label={'omgjøringavslåttvedtak'}>
            <Modal.Header>
                <Heading size="medium">Velg årsak og grunn for omgjøring</Heading>
                <BodyShort>{formatMessage('info')}</BodyShort>
            </Modal.Header>
            <Modal.Body>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            rules={{ required: 'Omgjøringsårsak er obligatorisk' }}
                            control={form.control}
                            name={'omgjøringsårsak'}
                            render={({ field: { value, ...field }, fieldState }) => (
                                <Select
                                    id={field.name}
                                    label={formatMessage('input.årsak.label')}
                                    error={fieldState.error?.message}
                                    value={value ?? ''}
                                    {...field}
                                >
                                    <option value="" disabled>
                                        {formatMessage('input.årsak.value')}
                                    </option>
                                    {Object.values(OmgjøringsÅrsak).map((grunn) => (
                                        <option value={grunn} key={grunn}>
                                            {formatMessage(grunn)}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                        <Controller
                            rules={{ required: 'Omgjøringsgrunn er obligatorisk' }}
                            control={form.control}
                            name={'omgjøringGrunn'}
                            render={({ field: { value, ...field }, fieldState }) => (
                                <Select
                                    id={field.name}
                                    label={formatMessage('input.omgjøringsgrunn.label')}
                                    error={fieldState.error?.message}
                                    value={value ?? ''}
                                    {...field}
                                >
                                    <option value="" disabled>
                                        {formatMessage('input.omgjøringsgrunn.value')}
                                    </option>
                                    {Object.values(OmgjøringsGrunn).map((grunn) => (
                                        <option value={grunn} key={grunn}>
                                            {formatMessage(grunn)}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                        <Button type="submit" loading={RemoteData.isPending(startNysøknadsbehandlingStatus)}>
                            Lagre
                        </Button>
                        {RemoteData.isSuccess(startNysøknadsbehandlingStatus) && (
                            <BodyShort>Omgjøringen ble opprettet, du kan nå lukke modalen</BodyShort>
                        )}
                        {RemoteData.isFailure(startNysøknadsbehandlingStatus) && (
                            <BodyShort>Vi kunne ikke opprette omgjøringen nå</BodyShort>
                        )}
                    </form>
                </FormProvider>
            </Modal.Body>
        </Modal>
    );
};

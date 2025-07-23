import { Modal , Heading, Select } from '@navikt/ds-react';
import { useState } from 'react';
import { FormProvider, useForm , Controller } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n.ts';
import { OmgjøringsGrunn, OmgjøringsÅrsak, OpprettetRevurderingGrunn } from '~src/types/Revurdering.ts';

import messages from './omgjøringsmodal-nb.ts';

export interface Omgjøringsfom {
    årsak: OpprettetRevurderingGrunn;
    omgjøringGrunn: OmgjøringsGrunn;
}

export const OmgjøringModal = ({
    eråpen,
    startNyBehandling,
}: {
    eråpen: boolean;
    startNyBehandling: (formdata: Omgjøringsfom) => void;
}) => {
    const { formatMessage } = useI18n({ messages });

    const [åpenModal, setÅpenModal] = useState<boolean>(eråpen);
    const form = useForm<Omgjøringsfom>({});
    const { handleSubmit } = form;
    const onSubmit = (formdata: Omgjøringsfom) => {
        startNyBehandling(formdata);
    };
    return (
        <Modal open={åpenModal} onClose={() => setÅpenModal(false)} aria-label={'omgjøringavslåttvedtak'}>
            <Modal.Header>
                <Heading size="medium">Velg årsak og grunn for omgjøring</Heading>
            </Modal.Header>
            <Modal.Body>
                <FormProvider {...form}>
                    <Heading level="2" size="small">
                        Velg grunn
                    </Heading>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            rules={{ required: 'Omgjørignsårsak er obligatorisk' }}
                            control={form.control}
                            name={'årsak'}
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
                    </form>
                </FormProvider>
            </Modal.Body>
        </Modal>
    );
};

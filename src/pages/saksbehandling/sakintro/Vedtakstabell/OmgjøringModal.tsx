import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Modal, Select } from '@navikt/ds-react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Klage } from '~src/types/Klage';
import { OmgjøringsGrunn, OmgjøringsÅrsak } from '~src/types/Revurdering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import messages from './omgjøringsmodal-nb';

export interface Omgjøringsfom {
    omgjøringsårsak: OmgjøringsÅrsak;
    omgjøringGrunn: OmgjøringsGrunn;
    klageId?: string;
}

export const OmgjøringModal = ({
    åpenModal,
    setÅpenModal,
    startNyBehandling,
    startNysøknadsbehandlingStatus,
    klager,
}: {
    åpenModal: boolean;
    setÅpenModal: (åpen: boolean) => void;
    startNyBehandling: (formdata: Omgjøringsfom) => void;
    startNysøknadsbehandlingStatus: ApiResult<Søknadsbehandling>;
    klager: Klage[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const form = useForm<Omgjøringsfom>({});
    const { handleSubmit } = form;
    const onSubmit = (formdata: Omgjøringsfom) => {
        startNyBehandling(formdata);
    };

    const omgjøringsÅrsak = form.watch('omgjøringsårsak');
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
                        {omgjøringsÅrsak && omgjøringsÅrsak !== OmgjøringsÅrsak.OMGJØRING_EGET_TILTAK && (
                            <>
                                {klager.length > 0 ? (
                                    <Controller
                                        control={form.control}
                                        name={'klageId'}
                                        rules={{
                                            required: 'Klageid er obligatorisk for denne omgjøringsårsaken',
                                        }}
                                        render={({ field: { value, ...field }, fieldState }) => (
                                            <Select
                                                id={field.name}
                                                label={formatMessage('klage.knyttet.mot')}
                                                error={fieldState.error?.message}
                                                value={value ?? ''}
                                                {...field}
                                            >
                                                <option value="" disabled>
                                                    {formatMessage('klage.mottattdato')}
                                                </option>
                                                {klager.map((klage) => (
                                                    <option value={klage.id} key={klage.id}>
                                                        {klage.datoKlageMottatt}
                                                    </option>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                ) : (
                                    <Alert variant="warning">
                                        Finner ingen klager å knytte klageomgjøringen mot, dette er påkrevd for å få
                                        opprettet en klageomgjøring
                                    </Alert>
                                )}
                            </>
                        )}
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
                            <BodyShort>{`Vi kunne ikke opprette omgjøringen nå. Feil: ${startNysøknadsbehandlingStatus.error.body.message}`}</BodyShort>
                        )}
                    </form>
                </FormProvider>
            </Modal.Body>
        </Modal>
    );
};

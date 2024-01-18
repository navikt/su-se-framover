import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, TextField } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as SakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

import messages from './DokumentForm-nb';
import * as styles from './DokumentForm.module.less';

interface DokumentFormData {
    tittel: Nullable<string>;
    fritekst: Nullable<string>;
}

const dokumentSchema = yup.object<DokumentFormData>({
    tittel: yup.string().required().nullable(),
    fritekst: yup.string().required().nullable(),
});

const DokumentForm = () => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const context = useOutletContext<SaksoversiktContext>();
    const [lagreOgSendStatus, lagreOgSendApi] = useApiCall(SakApi.lagreOgSendFritekstDokument);

    const form = useForm<DokumentFormData>({
        defaultValues: {
            tittel: null,
            fritekst: null,
        },
        resolver: yupResolver(dokumentSchema),
    });

    return (
        <form
            className={styles.pageContainer}
            onSubmit={form.handleSubmit((values) =>
                lagreOgSendApi(
                    {
                        sakId: context.sak.id,
                        tittel: values.tittel!,
                        fritekst: values.fritekst!,
                    },
                    () => {
                        navigate(Routes.alleDokumenterForSak.createURL({ sakId: context.sak.id }));
                    },
                ),
            )}
        >
            <Heading level="2" size={'large'}>
                {formatMessage('page.tittel')}
            </Heading>
            <Controller
                control={form.control}
                name={'tittel'}
                render={({ field, fieldState }) => (
                    <TextField label={'Tittel'} onChange={field.onChange} error={fieldState.error?.message} />
                )}
            />
            <Controller
                control={form.control}
                name={'fritekst'}
                render={({ field, fieldState }) => (
                    <BrevInput
                        tekst={field.value}
                        onVisBrevClick={() =>
                            SakApi.opprettFritekstDokument({
                                sakId: context.sak.id,
                                tittel: form.watch('tittel') ?? '',
                                fritekst: form.watch('fritekst') ?? '',
                            })
                        }
                        feil={fieldState.error}
                        onChange={field.onChange}
                    />
                )}
            />
            <div className={styles.buttonContainer}>
                <LinkAsButton
                    variant="secondary"
                    href={Routes.saksoversiktValgtSak.createURL({ sakId: context.sak.id })}
                >
                    {formatMessage('knapp.tilbake')}
                </LinkAsButton>
                <Button loading={RemoteData.isPending(lagreOgSendStatus)}>{formatMessage('knapp.lagreOgSend')}</Button>
            </div>
            {RemoteData.isFailure(lagreOgSendStatus) && <ApiErrorAlert error={lagreOgSendStatus.error} />}
        </form>
    );
};

export default DokumentForm;

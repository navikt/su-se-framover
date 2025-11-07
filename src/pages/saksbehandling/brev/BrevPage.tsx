import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    Checkbox,
    FileUpload,
    Heading,
    Radio,
    RadioGroup,
    Select,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as SakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DokumentDistribusjonForm from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonForm';
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Distribusjonstype } from '~src/types/dokument/Dokument';

import styles from './BrevPage.module.less';
import { DokumentFormData, distribusjonstypeTextMapper, dokumentSchema } from './BrevPageUtils';

const BrevPage = () => {
    const navigate = useNavigate();

    const context = useOutletContext<SaksoversiktContext>();
    const [sendBrevStatus, sendBrev] = useApiCall(SakApi.lagreOgSendFritekstDokument);

    const form = useForm<DokumentFormData>({
        defaultValues: {
            tittel: '',
            fritekst: '',
            vilHellerLasteOppPdf: false,
            fileObject: null,
            skalSendeTilAnnenAdresse: false,
            adresse: {
                adresser: [{ adresselinje: '' }],
                postnummer: '',
                poststed: '',
            },
            distribusjonstype: null,
        },
        resolver: yupResolver(dokumentSchema),
    });

    return (
        <form
            className={styles.pageContainer}
            onSubmit={form.handleSubmit((values) =>
                sendBrev(
                    {
                        sakId: context.sak.id,
                        tittel: values.tittel!,
                        fritekst: values.vilHellerLasteOppPdf ? null : values.fritekst!,
                        pdf: values.vilHellerLasteOppPdf ? values.fileObject!.file : null,
                        adresse: values.skalSendeTilAnnenAdresse
                            ? {
                                  adresselinje1: values.adresse!.adresser[0]!.adresselinje,
                                  adresselinje2: values.adresse?.adresser[1]?.adresselinje
                                      ? values.adresse.adresser[1].adresselinje
                                      : null,
                                  adresselinje3: values.adresse?.adresser[2]?.adresselinje
                                      ? values.adresse.adresser[2].adresselinje
                                      : null,
                                  postnummer: values.adresse!.postnummer,
                                  poststed: values.adresse!.poststed,
                              }
                            : null,
                        distribusjonstype: values.distribusjonstype!,
                    },
                    () => {
                        navigate(Routes.alleDokumenterForSak.createURL({ sakId: context.sak.id }));
                    },
                ),
            )}
        >
            <Heading level="2" size={'large'}>
                Opprett og send nytt fritekst brev
            </Heading>
            <Box className={styles.box} background="bg-default" padding="6">
                <Controller
                    control={form.control}
                    name={'skalSendeTilAnnenAdresse'}
                    render={({ field }) => (
                        <RadioGroup legend="Skal brevet sendes til en annen adresse?" {...field}>
                            <Radio value={true}>Ja</Radio>
                            <Radio value={false}>Nei</Radio>
                        </RadioGroup>
                    )}
                />
                {form.watch('skalSendeTilAnnenAdresse') && (
                    <DokumentDistribusjonForm prependNames="adresse" control={form.control} />
                )}
                <hr />

                <Controller
                    control={form.control}
                    name={'distribusjonstype'}
                    render={({ field, fieldState }) => (
                        <Select
                            {...field}
                            label={'Velg distribusjonstype'}
                            value={field.value ?? ''}
                            error={fieldState.error?.message}
                        >
                            <option value="">Velg distribusjonstype</option>
                            {Object.values(Distribusjonstype).map((type) => (
                                <option value={type} key={type}>
                                    {distribusjonstypeTextMapper(type)}
                                </option>
                            ))}
                        </Select>
                    )}
                />

                <Controller
                    control={form.control}
                    name={'tittel'}
                    render={({ field, fieldState }) => (
                        <TextField label={'Tittel'} onChange={field.onChange} error={fieldState.error?.message} />
                    )}
                />

                <Controller
                    control={form.control}
                    name={'vilHellerLasteOppPdf'}
                    render={({ field }) => (
                        <Checkbox {...field} checked={field.value}>
                            Jeg vil heller laste opp en PDF-fil
                        </Checkbox>
                    )}
                />

                {!form.watch('vilHellerLasteOppPdf') && (
                    <Controller
                        control={form.control}
                        name={'fritekst'}
                        render={({ field, fieldState }) => (
                            <BrevInput
                                tekst={field.value}
                                onVisBrevClick={() =>
                                    SakApi.opprettFritekstDokument({
                                        sakId: context.sak.id,
                                        tittel: form.watch('tittel'),
                                        fritekst: form.watch('fritekst'),
                                        //her er det valgt at dem skal skrive fritekst - da vil vi gjøre genereringen
                                        pdf: null,
                                        //adresse har ikke noe å si for visning av brevet
                                        adresse: null,
                                        //distibusjonstype har ikke noe å si for visning av brevet
                                        distribusjonstype: Distribusjonstype.ANNET,
                                    })
                                }
                                feil={fieldState.error}
                                onChange={field.onChange}
                            />
                        )}
                    />
                )}

                {form.watch('vilHellerLasteOppPdf') && (
                    <VStack gap="5">
                        <Controller
                            control={form.control}
                            name={'fileObject'}
                            render={({ field, fieldState }) => (
                                <FileUpload.Dropzone
                                    label="Last opp brevet"
                                    description={`Du kan laste opp PDF-filen. Maks 1 fil.`}
                                    accept=".pdf"
                                    fileLimit={{ max: 1, current: form.watch('fileObject') ? 1 : 0 }}
                                    onSelect={(f) => field.onChange(f[0])}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        {form.watch('fileObject') && (
                            <VStack gap="2">
                                <Heading level="3" size="xsmall">
                                    Vedlegg (1)
                                </Heading>
                                <FileUpload.Item
                                    file={form.watch('fileObject')!.file}
                                    button={{
                                        action: 'delete',
                                        onClick: () => form.setValue('fileObject', null),
                                    }}
                                />
                            </VStack>
                        )}
                    </VStack>
                )}
            </Box>

            {RemoteData.isFailure(sendBrevStatus) && <ApiErrorAlert error={sendBrevStatus.error} />}
            <div className={styles.buttonContainer}>
                <LinkAsButton
                    variant="secondary"
                    href={Routes.saksoversiktValgtSak.createURL({ sakId: context.sak.id })}
                >
                    Tilbake
                </LinkAsButton>
                <Button loading={RemoteData.isPending(sendBrevStatus)}>Lagre og send brev</Button>
            </div>
        </form>
    );
};

export default BrevPage;

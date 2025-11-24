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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import * as SakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DokumentDistribusjonForm from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonForm';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types.ts';
import { Distribusjonstype } from '~src/types/dokument/Dokument';
import styles from './BrevPage.module.less';
import { DokumentFormData, distribusjonstypeTextMapper, dokumentSchema } from './BrevPageUtils';

type HandleLagreFritekst = {
    fritekst: Nullable<string>;
};
const BrevPage = () => {
    const navigate = useNavigate();

    const context = useOutletContext<SaksoversiktContext>();
    const [sendBrevStatus, sendBrev] = useApiCall(SakApi.lagreOgSendFritekstDokument);
    const [BrevStatus, seBrev] = useBrevForhåndsvisning(SakApi.opprettFritekstDokument);
    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);

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

    useEffect(() => {
        hentFritekst({
            referanseId: context.sak.id,
            sakId: context.sak.id,
            type: FritekstTyper.FRITEKST_BREV,
        }).then((res) => {
            if (res.status === 'ok' && res.data) form.setValue('fritekst', res.data.fritekst);
        });
    }, [context.sak.id, form]);

    const handleSubmit = (data: DokumentFormData) => {
        return sendBrev(
            {
                sakId: context.sak.id,
                tittel: data.tittel!,
                fritekst: data.vilHellerLasteOppPdf ? null : data.fritekst!,
                pdf: data.vilHellerLasteOppPdf ? data.fileObject!.file : null,
                adresse: data.skalSendeTilAnnenAdresse
                    ? {
                          adresselinje1: data.adresse!.adresser[0]!.adresselinje,
                          adresselinje2: data.adresse?.adresser[1]?.adresselinje
                              ? data.adresse.adresser[1].adresselinje
                              : null,
                          adresselinje3: data.adresse?.adresser[2]?.adresselinje
                              ? data.adresse.adresser[2].adresselinje
                              : null,
                          postnummer: data.adresse!.postnummer,
                          poststed: data.adresse!.poststed,
                      }
                    : null,
                distribusjonstype: data.distribusjonstype!,
            },
            () => {
                navigate(Routes.alleDokumenterForSak.createURL({ sakId: context.sak.id }));
            },
        );
    };

    const handleLagreFritekst = (data: HandleLagreFritekst, onSuccess: () => void) => {
        return lagreFritekst(
            {
                referanseId: context.sak.id,
                sakId: context.sak.id,
                type: FritekstTyper.FRITEKST_BREV,
                fritekst: data.fritekst ?? '',
            },
            onSuccess,
        );
    };

    return (
        <form className={styles.pageContainer} onSubmit={form.handleSubmit(handleSubmit)}>
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
                    <TextareaWithAutosave
                        textarea={{
                            name: 'fritekst',
                            label: 'Fritekst til brev',
                            control: form.control,
                            value: form.watch('fritekst') ?? '',
                        }}
                        save={{
                            handleSave: () => {
                                handleLagreFritekst({ fritekst: form.getValues('fritekst') }, () => void 0);
                            },
                            status: lagreFritekstStatus,
                        }}
                        brev={{
                            handleSeBrev: () =>
                                seBrev({
                                    sakId: context.sak.id,
                                    tittel: form.watch('tittel'),
                                    fritekst: form.watch('fritekst'),
                                    //her er det valgt at de skal skrive fritekst - da vil vi gjøre genereringen
                                    pdf: null,
                                    //adresse har ikke noe å si for visning av brevet
                                    adresse: null,
                                    //distibusjonstype har ikke noe å si for visning av brevet
                                    distribusjonstype: Distribusjonstype.ANNET,
                                }),
                            status: BrevStatus,
                        }}
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

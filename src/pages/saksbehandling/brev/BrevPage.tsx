import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Heading, Radio, RadioGroup, Select, TextField } from '@navikt/ds-react';
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
                        fritekst: values.fritekst!,
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
                    name={'fritekst'}
                    render={({ field, fieldState }) => (
                        <BrevInput
                            tekst={field.value}
                            onVisBrevClick={() =>
                                SakApi.opprettFritekstDokument({
                                    sakId: context.sak.id,
                                    tittel: form.watch('tittel'),
                                    fritekst: form.watch('fritekst'),
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

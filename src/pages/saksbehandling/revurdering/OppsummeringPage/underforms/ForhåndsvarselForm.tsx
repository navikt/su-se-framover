import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as PdfApi from '~src/api/pdfApi';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { VisDokumenter } from '~src/pages/saksbehandling/dokumenter/DokumenterPage';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering } from '~src/types/Revurdering';

import messages from './ForhåndsvarselForm-nb';
import styles from './ForhåndsvarselForm.module.less';

interface ForhåndsvarselFormData {
    oppretterNyttForhåndsvarsel: boolean;
    fritekst: Nullable<string>;
}

const schema = yup.object<ForhåndsvarselFormData>({
    oppretterNyttForhåndsvarsel: yup.boolean(),
    fritekst: yup
        .string()
        .when('oppretterNyttForhåndsvarsel', {
            is: true,
            then: yup.string().required().nullable(),
            otherwise: yup.string().nullable().defined(),
        })
        .defined(),
});

const ForhåndsvarselForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    avsluttUrl: string;
    nesteUrl: string;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const form = useForm<ForhåndsvarselFormData>({
        defaultValues: { oppretterNyttForhåndsvarsel: false, fritekst: null },
        resolver: yupResolver(schema),
    });
    const watch = form.watch();

    const [lagreForhåndsvarselStatus, lagreForhåndsvarsel] = useAsyncActionCreator(
        RevurderingActions.lagreForhåndsvarsel
    );

    const handleSubmit = (values: ForhåndsvarselFormData) => {
        if (!values.oppretterNyttForhåndsvarsel) {
            navigate(props.nesteUrl);
        } else {
            lagreForhåndsvarsel(
                {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    fritekstTilBrev: values.fritekst!,
                },
                () => Routes.navigateToSakIntroWithMessage(navigate, formatMessage('forhåndsvarsel.sendt'), props.sakId)
            );
        }
    };

    return (
        <ToKolonner tittel={formatMessage('forhåndsvarsel.tittel')}>
            {{
                left: (
                    <FormWrapper
                        className={styles.stickyDiv}
                        form={form}
                        savingState={lagreForhåndsvarselStatus}
                        save={handleSubmit}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        nesteKnappTekst={
                            watch.oppretterNyttForhåndsvarsel
                                ? formatMessage('forhåndsvarsel.neste.sendOgNaviger')
                                : undefined
                        }
                        fortsettSenereKnappTekst={formatMessage('forhåndsvarsel.fortsettSenere')}
                    >
                        <div>
                            <div className={styles.formElementsContainer}>
                                <Controller
                                    name={'oppretterNyttForhåndsvarsel'}
                                    control={form.control}
                                    render={({ field }) => (
                                        <RadioGroup legend={formatMessage('forhåndsvarsel.skalSendes')} {...field}>
                                            <Radio value={true}>{formatMessage('forhåndsvarsel.skalSende.ja')}</Radio>
                                            <Radio value={false}>{formatMessage('forhåndsvarsel.skalSende.nei')}</Radio>
                                        </RadioGroup>
                                    )}
                                />

                                {watch.oppretterNyttForhåndsvarsel && (
                                    <Controller
                                        name={'fritekst'}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <BrevInput
                                                tittel={formatMessage('forhåndsvarsel.fritekst.label')}
                                                onVisBrevClick={() =>
                                                    PdfApi.fetchBrevutkastForForhåndsvarsel(
                                                        props.sakId,
                                                        props.revurdering.id,
                                                        field.value ?? ''
                                                    )
                                                }
                                                tekst={field.value ?? ''}
                                                {...field}
                                                feil={fieldState.error}
                                            />
                                        )}
                                    />
                                )}
                            </div>

                            <VisDokumenter
                                id={props.revurdering.id}
                                idType={DokumentIdType.Revurdering}
                                ingenBrevTekst={formatMessage('forhåndsvarsel.dokumenterAlert.ingenForhåndsvarsel')}
                            />
                        </div>
                    </FormWrapper>
                ),
                right: (
                    <OppsummeringAvInformasjonsrevurdering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={props.gjeldendeGrunnlagOgVilkår}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default ForhåndsvarselForm;

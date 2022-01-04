import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader, RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { UførhetFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { UførhetInput } from '~pages/saksbehandling/søknadsbehandling/uførhet/UføreInput';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './uførhet-nb';
import styles from './Uførhet.module.less';

interface FormData {
    status: Nullable<UføreResultat>;
    uføregrad: Nullable<string>;
    forventetInntekt: Nullable<string>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
    uføregrad: eqNullable(S.Eq),
    forventetInntekt: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                [UføreResultat.VilkårOppfylt, UføreResultat.VilkårIkkeOppfylt, UføreResultat.HarUføresakTilBehandling],
                'Du må velge om bruker har vedtak om uføretrygd eller uføresak til behandling'
            ),
        uføregrad: yup
            .number()
            .nullable()
            .defined()
            .when('status', {
                is: UføreResultat.VilkårOppfylt,
                then: yup
                    .number()
                    .positive()
                    .min(1)
                    .max(100)
                    .required('Du må oppgi uføregrad')
                    .typeError('Uføregrad må være mellom 1 og 100'),
                otherwise: yup.number().nullable().defined(),
            }) as unknown as yup.Schema<string>,
        forventetInntekt: yup
            .number()
            .nullable()
            .defined()
            .when('status', {
                is: UføreResultat.VilkårOppfylt,
                then: yup
                    .number()
                    .positive()
                    .integer()
                    .min(0)
                    .required('Du må oppgi forventet inntekt')
                    .typeError('Feltet må være et tall'),
                otherwise: yup.number().nullable().defined(),
            }) as unknown as yup.Schema<string>,
        begrunnelse: yup.string().nullable().defined().default(null),
    })
    .required();

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const [lagreBehandlingsinformasjonStatus, lagreUføregrunnlag] = useAsyncActionCreator(sakSlice.lagreUføregrunnlag);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();

    const { uføre } = props.behandling.grunnlagsdataOgVilkårsvurderinger;

    const initialFormData = useMemo<FormData>(() => {
        const uføreGrunnlag = uføre?.vurderinger[0].grunnlag;
        return {
            status: uføre?.resultat ?? null,
            uføregrad: uføreGrunnlag?.uføregrad?.toString() ?? null,
            forventetInntekt: uføreGrunnlag?.forventetInntekt?.toString() ?? null,
            begrunnelse: uføreGrunnlag?.begrunnelse || null,
        };
    }, [uføre]);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Uførhet,
        (values) => eqFormData.equals(values, initialFormData)
    );

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialFormData)) {
            clearDraft();
            history.push(nesteUrl);
            return;
        }

        await lagreUføregrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                uføregrad: values.uføregrad ? parseInt(values.uføregrad, 10) : null,
                forventetInntekt: values.forventetInntekt !== null ? parseInt(values.forventetInntekt, 10) : null,
                begrunnelse: values.begrunnelse ?? '',
                resultat: values.status,
                periode: {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fraOgMed: props.behandling.stønadsperiode!.periode.fraOgMed!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    tilOgMed: props.behandling.stønadsperiode!.periode.tilOgMed!,
                },
            },
            () => {
                clearDraft();
                history.push(nesteUrl);
            }
        );
    };

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: draft ?? initialFormData,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const watchStatus = form.watch('status');
    useEffect(() => {
        if (watchStatus === UføreResultat.VilkårIkkeOppfylt || watchStatus === UføreResultat.HarUføresakTilBehandling) {
            form.setValue('uføregrad', null, { shouldValidate: isSubmitted });
            form.setValue('forventetInntekt', null, { shouldValidate: isSubmitted });
        } else if (watchStatus === UføreResultat.VilkårOppfylt && isSubmitted) {
            form.trigger(['uføregrad', 'forventetInntekt']);
        }
    }, [watchStatus]);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <>
                        <form
                            onSubmit={form.handleSubmit(
                                handleSave(props.nesteUrl),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                        >
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        className={styles.radioGruppe}
                                        legend={formatMessage('radio.uførhet.legend')}
                                        error={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                        onChange={(val) => field.onChange(val)}
                                        value={field.value ?? ''}
                                    >
                                        <Radio id={field.name} value={UføreResultat.VilkårOppfylt} ref={field.ref}>
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={UføreResultat.VilkårIkkeOppfylt}>
                                            {formatMessage('radio.label.nei')}
                                        </Radio>
                                        <Radio value={UføreResultat.HarUføresakTilBehandling}>
                                            {formatMessage('radio.label.uføresakTilBehandling')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                            {watchStatus === UføreResultat.VilkårOppfylt && (
                                <div className={styles.formInputContainer}>
                                    <Controller
                                        control={form.control}
                                        name="uføregrad"
                                        render={({ field, fieldState }) => (
                                            <UførhetInput
                                                tittel={formatMessage('input.label.uføregrad')}
                                                inputName="uføregrad"
                                                inputTekst="%"
                                                feil={fieldState.error?.message}
                                                onChange={field.onChange}
                                                value={field.value ?? ''}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name="forventetInntekt"
                                        render={({ field, fieldState }) => (
                                            <UførhetInput
                                                tittel={formatMessage('input.label.forventetInntekt')}
                                                inputName="forventetInntekt"
                                                inputTekst=" NOK"
                                                feil={fieldState.error?.message}
                                                onChange={field.onChange}
                                                value={field.value ?? ''}
                                            />
                                        )}
                                    />
                                </div>
                            )}

                            <div className={sharedStyles.textareaContainer}>
                                <Controller
                                    control={form.control}
                                    name="begrunnelse"
                                    render={({ field, fieldState }) => (
                                        <Textarea
                                            label={formatMessage('input.label.begrunnelse')}
                                            error={fieldState.error?.message}
                                            {...field}
                                            value={field.value ?? ''}
                                            description={formatMessage('input.begrunnelse.description')}
                                        />
                                    )}
                                />
                            </div>

                            {pipe(
                                lagreBehandlingsinformasjonStatus,
                                RemoteData.fold(
                                    () => null,
                                    () => <Loader title={formatMessage('display.lagre.lagrer')} />,
                                    (err) => <ApiErrorAlert error={err} />,
                                    () => null
                                )
                            )}
                            <Feiloppsummering
                                tittel={formatMessage('feiloppsummering.title')}
                                hidden={!isSubmitted || isValid}
                                feil={hookFormErrorsTilFeiloppsummering(errors)}
                                ref={feiloppsummeringRef}
                            />
                            <Vurderingknapper
                                onTilbakeClick={() => {
                                    history.push(props.forrigeUrl);
                                }}
                                onLagreOgFortsettSenereClick={form.handleSubmit(
                                    handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                    focusAfterTimeout(feiloppsummeringRef)
                                )}
                            />
                        </form>
                    </>
                ),
                right: <UførhetFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;

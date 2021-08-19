import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { UførhetFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { UførhetInput } from '~pages/saksbehandling/søknadsbehandling/uførhet/UføreInput';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

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

const schema = yup.object<FormData>({
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
});

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const [lagreBehandlingsinformasjonStatus, lagreUføregrunnlag] = useAsyncActionCreator(sakSlice.lagreUføregrunnlag);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();

    const initialFormData = useMemo<FormData>(
        () => ({
            status: props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat ?? null,
            uføregrad: props.behandling.behandlingsinformasjon.uførhet?.uføregrad?.toString() ?? null,
            forventetInntekt: props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt?.toString() ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.uførhet?.begrunnelse || null,
        }),
        [props.behandling.behandlingsinformasjon]
    );

    const handleSave = (nesteUrl: string) => (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialFormData)) {
            history.push(nesteUrl);
            return;
        }

        lagreUføregrunnlag(
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
                history.push(nesteUrl);
            }
        );
    };

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: initialFormData,
        resolver: yupResolver(schema),
    });

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
                                    <RadioGruppe
                                        className={styles.radioGruppe}
                                        legend={formatMessage('radio.uførhet.legend')}
                                        feil={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                    >
                                        <Radio
                                            id={field.name}
                                            label={formatMessage('radio.label.ja')}
                                            name={field.name}
                                            onChange={() => field.onChange(UføreResultat.VilkårOppfylt)}
                                            defaultChecked={field.value === UføreResultat.VilkårOppfylt}
                                            radioRef={field.ref}
                                        />
                                        <Radio
                                            label={formatMessage('radio.label.nei')}
                                            name={field.name}
                                            onChange={() => field.onChange(UføreResultat.VilkårIkkeOppfylt)}
                                            defaultChecked={field.value === UføreResultat.VilkårIkkeOppfylt}
                                        />
                                        <Radio
                                            label={formatMessage('radio.label.uføresakTilBehandling')}
                                            name={field.name}
                                            onChange={() => field.onChange(UføreResultat.HarUføresakTilBehandling)}
                                            defaultChecked={field.value === UføreResultat.HarUføresakTilBehandling}
                                        />
                                    </RadioGruppe>
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
                                                bredde="XS"
                                                feil={fieldState.error?.message}
                                                {...field}
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
                                                bredde="L"
                                                feil={fieldState.error?.message}
                                                {...field}
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
                                            feil={fieldState.error?.message}
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    )}
                                />
                            </div>

                            {pipe(
                                lagreBehandlingsinformasjonStatus,
                                RemoteData.fold(
                                    () => null,
                                    () => (
                                        <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>
                                    ),
                                    () => (
                                        <AlertStripe type="feil">
                                            {formatMessage('display.lagre.lagringFeilet')}
                                        </AlertStripe>
                                    ),
                                    () => null
                                )
                            )}
                            <Feiloppsummering
                                tittel={formatMessage('feiloppsummering.title')}
                                hidden={!isSubmitted || isValid}
                                feil={hookFormErrorsTilFeiloppsummering(errors)}
                                innerRef={feiloppsummeringRef}
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

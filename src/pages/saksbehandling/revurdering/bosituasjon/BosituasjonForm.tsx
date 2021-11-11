import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { BodyShort, Heading, Label, Textarea } from '@navikt/ds-react';
import fnrValidator from '@navikt/fnrvalidator';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { FnrInput } from '~components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { BosituasjonRequest, Revurdering, RevurderingStegProps } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';

interface BosituasjonFormData {
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    delerSøkerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const GjeldendeBosituasjon = (props: { bosituasjon?: Bosituasjon[] }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });

    return (
        <div>
            <Heading level="2" size="large" spacing>
                {intl.formatMessage({ id: 'eksisterende.vedtakinfo.tittel' })}
            </Heading>
            <ul className={styles.grunnlagsliste}>
                {props.bosituasjon?.map((item, index) => (
                    <li key={index}>
                        <Label spacing>{DateUtils.formatPeriode(item.periode)}</Label>
                        <div className={styles.informasjonsbitContainer}>
                            <BodyShort>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.søkerBorMed' })}</BodyShort>
                            <Label>
                                {item.fnr
                                    ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.eps' })
                                    : item.delerBolig
                                    ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.over18år' })
                                    : intl.formatMessage({ id: 'eksisterende.vedtakinfo.enslig' })}
                            </Label>
                        </div>

                        {item.fnr && (
                            <div>
                                <div className={styles.informasjonsbitContainer}>
                                    <BodyShort>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.eps' })}</BodyShort>
                                    <Label>{item.fnr}</Label>
                                </div>
                                <div className={styles.informasjonsbitContainer}>
                                    <BodyShort>
                                        {intl.formatMessage({ id: 'eksisterende.vedtakinfo.mottarSU' })}
                                    </BodyShort>
                                    <Label>
                                        {item.ektemakeEllerSamboerUførFlyktning
                                            ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.ja' })
                                            : intl.formatMessage({ id: 'eksisterende.vedtakinfo.nei' })}
                                    </Label>
                                </div>
                            </div>
                        )}

                        <div className={styles.informasjonsbitContainer}>
                            <BodyShort>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.sats' })}</BodyShort>
                            <Label>{item.sats}</Label>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getDefaultValues = (revurdering: Revurdering, bosituasjon: Bosituasjon[]): BosituasjonFormData => {
    const bosituasjonLocal = revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon;

    if (bosituasjonLocal.length === 1) {
        return {
            harEPS: bosituasjonLocal[0].fnr !== null,
            epsFnr: bosituasjonLocal[0].fnr,
            delerSøkerBolig: bosituasjonLocal[0].delerBolig,
            erEPSUførFlyktning: bosituasjonLocal[0].ektemakeEllerSamboerUførFlyktning,
            begrunnelse: bosituasjonLocal[0].begrunnelse,
        };
    }

    if (bosituasjon.length !== 1) {
        return {
            harEPS: null,
            epsFnr: null,
            delerSøkerBolig: null,
            erEPSUførFlyktning: null,
            begrunnelse: null,
        };
    }

    return {
        harEPS: bosituasjon[0].fnr !== null,
        epsFnr: bosituasjon[0].fnr,
        delerSøkerBolig: bosituasjon[0].delerBolig,
        erEPSUførFlyktning: bosituasjon[0].ektemakeEllerSamboerUførFlyktning,
        begrunnelse: bosituasjon[0].begrunnelse,
    };
};

const EPSForm = (props: {
    control: Control<BosituasjonFormData>;
    setEpsAlder: (alder: Nullable<number>) => void;
    epsAlder: Nullable<number>;
    intl: IntlShape;
}) => {
    return (
        <div className={styles.epsFormContainer}>
            <Controller
                control={props.control}
                name="epsFnr"
                render={({ field, fieldState }) => (
                    <FnrInput
                        label={props.intl.formatMessage({ id: 'form.epsFnr' })}
                        inputId="epsFnr"
                        name="epsFnr"
                        autoComplete="on"
                        onFnrChange={field.onChange}
                        fnr={field.value ?? ''}
                        feil={fieldState.error?.message}
                        onAlderChange={(alder) => props.setEpsAlder(alder)}
                    />
                )}
            />
            {props.epsAlder && props.epsAlder < 67 && (
                <Controller
                    control={props.control}
                    name="erEPSUførFlyktning"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={props.intl.formatMessage({ id: 'form.erEPSUførFlyktning' })}
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />
            )}
        </div>
    );
};

const DelerSøkerBoligForm = (props: { control: Control<BosituasjonFormData>; intl: IntlShape }) => {
    return (
        <Controller
            control={props.control}
            name="delerSøkerBolig"
            render={({ field, fieldState }) => (
                <BooleanRadioGroup
                    legend={props.intl.formatMessage({ id: 'form.delerSøkerBolig' })}
                    error={fieldState.error?.message}
                    {...field}
                />
            )}
        />
    );
};

const BosituasjonForm = (props: RevurderingStegProps) => {
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [epsAlder, setEpsAlder] = useState<Nullable<number>>(null);
    const [status, setStatus] = React.useState<
        RemoteData.RemoteData<ApiError, { revurdering: Revurdering; feilmeldinger: ErrorMessage[] }>
    >(RemoteData.initial);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const schema = yup
        .object<BosituasjonFormData>({
            harEPS: yup.boolean().required('Feltet må fylles ut').nullable(),
            epsFnr: yup
                .string()
                .defined()
                .when('harEPS', {
                    is: true,
                    then: yup
                        .string()
                        .required()
                        .test({
                            name: 'Gyldig fødselsnummer',
                            message: 'Ugyldig fødselsnummer',
                            test: function (value) {
                                return (
                                    typeof value === 'string' &&
                                    value.length === 11 &&
                                    fnrValidator.fnr(value).status === 'valid'
                                );
                            },
                        }),
                }),
            delerSøkerBolig: yup.boolean().defined().when('harEPS', {
                is: false,
                then: yup.boolean().required(),
                otherwise: yup.boolean().defined(),
            }),
            erEPSUførFlyktning: yup
                .boolean()
                .defined()
                .when('harEPS', {
                    is: true,
                    then: yup.boolean().test({
                        name: 'er eps ufør flyktning',
                        message: 'Feltet må fylles ut',
                        test: function () {
                            if (epsAlder && epsAlder < 67) {
                                return this.parent.erEPSUførFlyktning !== null;
                            }
                            return true;
                        },
                    }),
                }),
            begrunnelse: yup.string().nullable().defined(),
        })
        .required();

    const {
        formState: { errors, isSubmitted },
        ...form
    } = useForm<BosituasjonFormData>({
        defaultValues: getDefaultValues(props.revurdering, props.grunnlagsdataOgVilkårsvurderinger.bosituasjon),
        resolver: yupResolver(schema),
    });

    function tilBosituasjonBody(body: {
        sakId: string;
        revurderingsId: string;
        data: BosituasjonFormData;
    }): BosituasjonRequest {
        if (body.data.harEPS) {
            return {
                sakId: body.sakId,
                revurderingId: body.revurderingsId,
                epsFnr: body.data.epsFnr,
                erEPSUførFlyktning: body.data.erEPSUførFlyktning,
                delerBolig: null,
                begrunnelse: body.data.begrunnelse,
            };
        }

        return {
            sakId: body.sakId,
            revurderingId: body.revurderingsId,
            epsFnr: null,
            erEPSUførFlyktning: null,
            delerBolig: body.data.delerSøkerBolig,
            begrunnelse: body.data.begrunnelse,
        };
    }

    const handleSubmit = async (data: BosituasjonFormData, gåtil: 'neste' | 'avbryt') => {
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.lagreBosituasjonsgrunnlag(
                tilBosituasjonBody({
                    sakId: props.sakId,
                    revurderingsId: props.revurdering.id,
                    data: {
                        harEPS: data.harEPS,
                        epsFnr: data.epsFnr,
                        erEPSUførFlyktning: data.erEPSUførFlyktning,
                        delerSøkerBolig: data.delerSøkerBolig,
                        begrunnelse: data.begrunnelse,
                    },
                })
            )
        );

        if (revurderingActions.lagreBosituasjonsgrunnlag.fulfilled.match(res)) {
            setStatus(RemoteData.success(res.payload));
            if (res.payload.feilmeldinger.length === 0) {
                history.push(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl);
            }
        }
        if (revurderingActions.lagreBosituasjonsgrunnlag.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setStatus(RemoteData.failure(res.payload!));
        }
    };

    React.useEffect(() => {
        if (isSubmitted) {
            form.trigger();
        }
    }, [form.watch('harEPS')]);
    React.useEffect(() => {
        if (isSubmitted) {
            form.trigger('erEPSUførFlyktning');
        }
    }, [epsAlder]);

    const harEPS = form.watch('harEPS');

    useEffect(() => {
        if (harEPS === null) {
            return;
        }
        if (harEPS) {
            resetDelerSøkerBoligForm();
        } else {
            resetEPSForm();
        }
    }, [harEPS]);

    function resetEPSForm() {
        form.setValue('epsFnr', null);
        form.setValue('erEPSUførFlyktning', null);
        setEpsAlder(null);
    }

    function resetDelerSøkerBoligForm() {
        form.setValue('delerSøkerBolig', null);
    }

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={classNames(sharedStyles.revurderingContainer, styles.container)}
                        onSubmit={form.handleSubmit((values) => handleSubmit(values, 'neste'))}
                    >
                        <Controller
                            control={form.control}
                            name="harEPS"
                            render={({ field, fieldState }) => (
                                <BooleanRadioGroup
                                    legend={intl.formatMessage({ id: 'form.harSøkerEPS' })}
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                        {harEPS && (
                            <EPSForm control={form.control} setEpsAlder={setEpsAlder} epsAlder={epsAlder} intl={intl} />
                        )}
                        {harEPS === false && <DelerSøkerBoligForm control={form.control} intl={intl} />}
                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label={intl.formatMessage({ id: 'form.begrunnelse' })}
                                    name="begrunnelse"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    error={fieldState.error}
                                />
                            )}
                        />
                        <Feiloppsummering
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            className={styles.feiloppsummering}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            hidden={Object.values(errors).length <= 0}
                        />
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        {RemoteData.isSuccess(status) && (
                            <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                        )}
                        <RevurderingBunnknapper
                            tilbakeUrl={props.forrigeUrl}
                            loading={RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={form.handleSubmit((values) => handleSubmit(values, 'avbryt'))}
                        />
                    </form>
                ),
                right: <GjeldendeBosituasjon bosituasjon={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon} />,
            }}
        </ToKolonner>
    );
};

export default BosituasjonForm;

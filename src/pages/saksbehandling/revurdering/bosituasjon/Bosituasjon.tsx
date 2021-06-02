import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import fnrValidator from '@navikt/fnrvalidator';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import { Ingress, Element, Normaltekst } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { FnrInput } from '~pages/søknad/steg/bo-og-opphold-i-norge/EktefellePartnerSamboer';
import { useAppDispatch } from '~redux/Store';
import { Bosituasjon } from '~types/Grunnlag';
import { Periode } from '~types/Periode';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './bosituasjon-nb';
import styles from './bosituasjon.module.less';

interface BosituasjonFormData {
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    delerSøkerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const GjeldendeBosituasjon = (props: { bosituasjon?: Bosituasjon[]; revurderingsperiode: Periode<string> }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

    return (
        <div>
            <Ingress className={styles.eksisterendeVedtakTittel}>
                {intl.formatMessage({ id: 'eksisterende.vedtakinfo.tittel' })}
            </Ingress>
            <ul className={styles.grunnlagsliste}>
                {props.bosituasjon?.map((item, index) => (
                    <li key={index}>
                        <Element>
                            {DateUtils.formatMonthYear(props.revurderingsperiode.fraOgMed, intl)}
                            {' – '}
                            {DateUtils.formatMonthYear(props.revurderingsperiode.tilOgMed, intl)}
                        </Element>
                        <div className={styles.informasjonsbitContainer}>
                            <Normaltekst>
                                {intl.formatMessage({ id: 'eksisterende.vedtakinfo.søkerBorMed' })}
                            </Normaltekst>
                            <Element>
                                {item.fnr
                                    ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.eps' })
                                    : item.delerBolig
                                    ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.over18år' })
                                    : intl.formatMessage({ id: 'eksisterende.vedtakinfo.enslig' })}
                            </Element>
                        </div>

                        {item.fnr && (
                            <div>
                                <div className={styles.informasjonsbitContainer}>
                                    <Normaltekst>
                                        {intl.formatMessage({ id: 'eksisterende.vedtakinfo.eps' })}
                                    </Normaltekst>
                                    <Element>{item.fnr}</Element>
                                </div>
                                <div className={styles.informasjonsbitContainer}>
                                    <Normaltekst>
                                        {intl.formatMessage({ id: 'eksisterende.vedtakinfo.mottarSU' })}
                                    </Normaltekst>
                                    <Element>
                                        {item.ektemakeEllerSamboerUførFlyktning
                                            ? intl.formatMessage({ id: 'eksisterende.vedtakinfo.ja' })
                                            : intl.formatMessage({ id: 'eksisterende.vedtakinfo.nei' })}
                                    </Element>
                                </div>
                            </div>
                        )}

                        <div className={styles.informasjonsbitContainer}>
                            <Normaltekst>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.sats' })}</Normaltekst>
                            <span>
                                <Element>HER TRENGER VI SATS</Element>
                                🏋️🏋️🏋️
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const setDefaultValues = (bosituasjon: Bosituasjon[]) => {
    if (bosituasjon.length !== 1) {
        return {
            harEPS: null,
            epsFnr: null,
            delerSøkerBolig: null,
            erEPSUførFlyktning: null,
        };
    }

    return {
        harEPS: bosituasjon[0].fnr !== null,
        epsFnr: bosituasjon[0].fnr,
        delerSøkerBolig: bosituasjon[0].delerBolig,
        erEPSUførFlyktning: bosituasjon[0].ektemakeEllerSamboerUførFlyktning,
    };
};

const Bosituasjon = (props: {
    sakId: string;
    revurdering: Revurdering;
    gjeldendeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: string;
}) => {
    const intl = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [epsAlder, setEPSAlder] = useState<Nullable<number>>(null);
    const [status, setStatus] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const schema = yup.object<BosituasjonFormData>({
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
        begrunnelse: yup.string(),
    });

    const {
        formState: { errors, isSubmitted },
        ...form
    } = useForm<BosituasjonFormData>({
        defaultValues: setDefaultValues(props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.bosituasjon),
        resolver: yupResolver(schema),
    });

    const handleSubmit = async (data: BosituasjonFormData) => {
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.lagreBosituasjonsgrunnlag({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                epsFnr: data.epsFnr,
                epsUførFlyktning: data.erEPSUførFlyktning,
                delerBolig: data.delerSøkerBolig,
                begrunnelse: data.begrunnelse,
            })
        );

        if (revurderingActions.lagreBosituasjonsgrunnlag.fulfilled.match(res)) {
            setStatus(RemoteData.success(null));
            history.push(props.nesteUrl);
        }
        if (revurderingActions.lagreBosituasjonsgrunnlag.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setStatus(RemoteData.failure(res.payload!));
        }
    };

    const DelerSøkerBoligForm = () => {
        return (
            <Controller
                control={form.control}
                name="delerSøkerBolig"
                render={({ field, fieldState }) => (
                    <RadioGruppe
                        legend={intl.formatMessage({ id: 'form.delerSøkerBolig' })}
                        feil={fieldState.error?.message}
                    >
                        <Radio
                            label="Ja"
                            name="delerSøkerBolig"
                            checked={field.value === true}
                            onChange={() => field.onChange(true)}
                        />
                        <Radio
                            label="Nei"
                            name="delerSøkerBolig"
                            checked={field.value === false}
                            onChange={() => field.onChange(false)}
                        />
                    </RadioGruppe>
                )}
            />
        );
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

    const EPSForm = () => {
        return (
            <div className={styles.epsFormContainer}>
                <Controller
                    control={form.control}
                    name="epsFnr"
                    render={({ field, fieldState }) => (
                        <FnrInput
                            label={intl.formatMessage({ id: 'form.epsFnr' })}
                            inputId="epsFnr"
                            name="epsFnr"
                            autoComplete="on"
                            onFnrChange={field.onChange}
                            fnr={field.value ?? ''}
                            feil={fieldState.error?.message}
                            onAlderChange={(alder) => setEPSAlder(alder)}
                        />
                    )}
                />
                {epsAlder && epsAlder < 67 && (
                    <Controller
                        control={form.control}
                        name="erEPSUførFlyktning"
                        render={({ field, fieldState }) => (
                            <RadioGruppe
                                legend={intl.formatMessage({ id: 'form.erEPSUførFlyktning' })}
                                feil={fieldState.error?.message}
                            >
                                <Radio
                                    label="Ja"
                                    name="erEPSUførFlyktning"
                                    checked={field.value === true}
                                    onChange={() => field.onChange(true)}
                                />
                                <Radio
                                    label="Nei"
                                    name="erEPSUførFlyktning"
                                    checked={field.value === false}
                                    onChange={() => field.onChange(false)}
                                />
                            </RadioGruppe>
                        )}
                    />
                )}
            </div>
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form className={sharedStyles.revurderingContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                        <div>
                            <div className={styles.bosituasjonInputsContainer}>
                                <Controller
                                    control={form.control}
                                    name="harEPS"
                                    render={({ field, fieldState }) => (
                                        <RadioGruppe
                                            legend={intl.formatMessage({ id: 'form.harSøkerEPS' })}
                                            feil={fieldState.error?.message}
                                        >
                                            <Radio
                                                label="Ja"
                                                name="harEPS"
                                                checked={field.value === true}
                                                onChange={() => field.onChange(true)}
                                            />
                                            <Radio
                                                label="Nei"
                                                name="harEPS"
                                                checked={field.value === false}
                                                onChange={() => field.onChange(false)}
                                            />
                                        </RadioGruppe>
                                    )}
                                />
                                {form.watch('harEPS') && <EPSForm />}
                                {form.watch('harEPS') === false && <DelerSøkerBoligForm />}
                            </div>
                            <div className={styles.textAreaContainer}>
                                <Controller
                                    control={form.control}
                                    name="begrunnelse"
                                    render={({ field, fieldState }) => (
                                        <Textarea
                                            label={intl.formatMessage({ id: 'form.begrunnelse' })}
                                            name="begrunnelse"
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            feil={fieldState.error}
                                        />
                                    )}
                                />
                            </div>
                            <Feiloppsummering
                                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(errors)}
                                hidden={!(Object.values(errors).length > 0)}
                            />
                            {RemoteData.isFailure(status) && <RevurderingskallFeilet error={status.error} />}
                            <RevurderingBunnknapper
                                onNesteClick="submit"
                                tilbakeUrl={props.forrigeUrl}
                                onNesteClickSpinner={RemoteData.isPending(status)}
                            />
                        </div>
                    </form>
                ),
                right: (
                    <GjeldendeBosituasjon
                        bosituasjon={props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        revurderingsperiode={props.revurdering.periode}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Bosituasjon;

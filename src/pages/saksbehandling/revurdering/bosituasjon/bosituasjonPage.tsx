import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import { startOfMonth, endOfMonth } from 'date-fns';
import React from 'react';
import { Control, Controller, useFieldArray, useForm, UseFormWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { FnrInput } from '~components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreBosituasjonsgrunnlag } from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { getDateErrorMessage, hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Periode } from '~types/Periode';
import { RevurderingStegProps } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedMessages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';
import {
    BosituasjonFormData,
    BosituasjonFormItemData,
    bosituasjonFormSchema,
    bosituasjonTilFormItemData,
    nyBosituasjon,
} from './bosituasjonPageUtils';
import GjeldendeBosituasjon from './GjeldendeBosituasjon';

const BosituasjonPage = (props: RevurderingStegProps) => {
    const history = useHistory();
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjonsgrunnlag);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const defaultVerdier = (bosituasjoner: Bosituasjon[]): BosituasjonFormItemData[] => {
        return bosituasjoner.map((b) => bosituasjonTilFormItemData(b)) ?? [];
    };

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<BosituasjonFormData>({
        defaultValues: {
            bosituasjoner: defaultVerdier(props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon),
        },
        resolver: yupResolver(bosituasjonFormSchema),
    });

    const lagreBosituasjon = (data: BosituasjonFormData, gåtil: 'neste' | 'avbryt') =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                bosituasjoner: data.bosituasjoner.map((b) => ({
                    periode: {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: DateUtils.toIsoDateOnlyString(b.fraOgMed!),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: DateUtils.toIsoDateOnlyString(b.tilOgMed!),
                    },
                    epsFnr: b.harEPS ? b.epsFnr : null,
                    delerBolig: b.harEPS ? null : b.delerBolig,
                    erEPSUførFlyktning: b.harEPS && b.epsAlder && b.epsAlder < 67 ? b.erEPSUførFlyktning : null,
                    begrunnelse: b.begrunnelse,
                })),
            },
            () => history.push(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
        );

    const items = useFieldArray({
        control: control,
        name: 'bosituasjoner',
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={classNames(sharedStyles.revurderingContainer, styles.container)}
                        onSubmit={handleSubmit((values) => lagreBosituasjon(values, 'neste'))}
                    >
                        <ul className={styles.periodeliste}>
                            {items.fields.map((item, idx) => (
                                <li key={item.id}>
                                    <BosituasjonFormItem
                                        controller={control}
                                        watch={watch}
                                        update={(idx: number, data: BosituasjonFormItemData) => {
                                            setValue(`bosituasjoner.${idx}`, data);
                                        }}
                                        data={item}
                                        index={idx}
                                        onDelete={() => items.remove(idx)}
                                        bosituasjonArrayLengde={items.fields.length}
                                        revurderingsperiode={{
                                            fraOgMed: props.revurdering.periode.fraOgMed,
                                            tilOgMed: props.revurdering.periode.tilOgMed,
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className={styles.nyPeriodeKnappContainer}>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => items.append(nyBosituasjon(), { shouldFocus: true })}
                            >
                                {formatMessage('form.ny.bosituasjon')}
                            </Button>
                        </div>
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            className={styles.feiloppsummering}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            hidden={Object.values(errors).length <= 0}
                        />
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        {RemoteData.isSuccess(status) && (
                            <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                        )}
                        <RevurderingBunnknapper
                            tilbake={props.forrige}
                            loading={RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={handleSubmit((values: BosituasjonFormData) =>
                                lagreBosituasjon(values, 'avbryt')
                            )}
                        />
                    </form>
                ),
                right: (
                    <GjeldendeBosituasjon
                        bosituasjon={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        formatMessage={formatMessage}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export const BosituasjonFormItem = (props: {
    controller: Control<BosituasjonFormData>;
    watch: UseFormWatch<BosituasjonFormData>;
    update: (idx: number, data: BosituasjonFormItemData) => void;
    data: BosituasjonFormItemData;
    index: number;
    bosituasjonArrayLengde: number;
    revurderingsperiode: Periode<string>;
    onDelete: () => void;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const watch = props.watch().bosituasjoner[props.index];

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    return (
        <Panel className={styles.formItemContainer} border>
            <div className={styles.periodeContainer}>
                <div className={styles.periodeContainer}>
                    <Controller
                        name={`bosituasjoner.${props.index}.fraOgMed`}
                        control={props.controller}
                        defaultValue={props.data.fraOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                id={field.name}
                                label={formatMessage('form.fraOgMed')}
                                feil={getDateErrorMessage(fieldState.error)}
                                {...field}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                onChange={(date: Nullable<Date>) => field.onChange(date ? startOfMonth(date) : null)}
                                minDate={revurderingsperiode.fraOgMed}
                                maxDate={revurderingsperiode.tilOgMed}
                                startDate={field.value}
                                endDate={watch.tilOgMed}
                            />
                        )}
                    />
                    <Controller
                        name={`bosituasjoner.${props.index}.tilOgMed`}
                        control={props.controller}
                        defaultValue={props.data.tilOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                id={field.name}
                                label={formatMessage('form.tilOgMed')}
                                feil={getDateErrorMessage(fieldState.error)}
                                {...field}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                onChange={(date: Date) => field.onChange(date ? endOfMonth(date) : date)}
                                minDate={watch.fraOgMed}
                                maxDate={revurderingsperiode.tilOgMed}
                                startDate={watch.fraOgMed}
                                endDate={field.value}
                            />
                        )}
                    />
                </div>
                {props.onDelete && props.bosituasjonArrayLengde > 1 && (
                    <Button
                        variant="secondary"
                        className={styles.slettknapp}
                        onClick={props.onDelete}
                        size="small"
                        aria-label={formatMessage('form.fjern.bosituasjon')}
                    >
                        <Delete />
                    </Button>
                )}
            </div>

            <div className={styles.formItemInputContainer}>
                <Controller
                    control={props.controller}
                    name={`bosituasjoner.${props.index}.harEPS`}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('form.harSøkerEPS')}
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />
                {watch.harEPS && (
                    <BosituasjonFormItemEps
                        formControl={props.controller}
                        index={props.index}
                        setEpsAlder={(alder: Nullable<number>) => {
                            props.update(props.index, {
                                ...watch,
                                epsAlder: alder,
                            });
                        }}
                        epsAlder={watch.epsAlder}
                        formatMessage={formatMessage}
                    />
                )}
                {watch.harEPS === false && (
                    <Controller
                        control={props.controller}
                        name={`bosituasjoner.${props.index}.delerBolig`}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('form.delerBolig')}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                )}
                <Controller
                    control={props.controller}
                    name={`bosituasjoner.${props.index}.begrunnelse`}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('form.begrunnelse')}
                            name={`bosituasjoner.${props.index}.begrunnelse`}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={fieldState.error}
                            description={formatMessage('form.beskrivelse')}
                        />
                    )}
                />
            </div>
        </Panel>
    );
};

const BosituasjonFormItemEps = (props: {
    formControl: Control<BosituasjonFormData>;
    index: number;
    setEpsAlder: (alder: Nullable<number>) => void;
    epsAlder: Nullable<number>;
    formatMessage: MessageFormatter<typeof messages>;
}) => (
    <div className={styles.epsFormContainer}>
        <Controller
            control={props.formControl}
            name={`bosituasjoner.${props.index}.epsFnr`}
            render={({ field, fieldState }) => (
                <FnrInput
                    label={props.formatMessage('form.epsFnr')}
                    inputId="epsFnr"
                    name={`bosituasjoner.${props.index}.epsFnr`}
                    onFnrChange={field.onChange}
                    fnr={field.value ?? ''}
                    feil={fieldState.error?.message}
                    getHentetPerson={(person) => {
                        props.setEpsAlder(person?.alder ?? null);
                    }}
                />
            )}
        />
        {props.epsAlder && props.epsAlder < 67 && (
            <Controller
                control={props.formControl}
                name={`bosituasjoner.${props.index}.erEPSUførFlyktning`}
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend={props.formatMessage('form.erEPSUførFlyktning')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        )}
    </div>
);

export default BosituasjonPage;

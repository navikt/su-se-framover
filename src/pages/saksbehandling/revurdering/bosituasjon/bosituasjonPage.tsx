import * as RemoteData from '@devexperts/remote-data-ts';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import { startOfMonth, endOfMonth } from 'date-fns';
import React, { useState } from 'react';
import { Control, Controller, useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

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
import * as DateUtils from '~utils/date/dateUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedMessages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';
import GjeldendeBosituasjon from './GjeldendeBosituasjon';

interface BosituasjonPageProps {
    eksisterendeBosituasjoner: Bosituasjon[];
    nyeBosituasjoner: Bosituasjon[];
    sakId: string;
    revurderingId: string;
    nesteUrl: string;
    forrige: { url: string; visModal: boolean };
    avsluttUrl: string;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
}

export interface BosituasjonFormItemData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const BosituasjonPage = (props: BosituasjonPageProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const bosituasjonTilFormItemData = (bosituasjon: Bosituasjon): BosituasjonFormItemData => ({
        id: uuid(),
        fraOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.fraOgMed),
        tilOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.tilOgMed),
        harEPS: bosituasjon.fnr !== null,
        epsFnr: bosituasjon.fnr,
        delerBolig: bosituasjon.delerBolig,
        erEPSUførFlyktning: bosituasjon.ektemakeEllerSamboerUførFlyktning,
        begrunnelse: bosituasjon.begrunnelse,
    });

    const defaultVerdier = (bosituasjoner: Bosituasjon[]): BosituasjonFormItemData[] => {
        return bosituasjoner.map((b) => bosituasjonTilFormItemData(b)) ?? [];
    };

    const form = useForm<BosituasjonFormData>({
        defaultValues: {
            bosituasjoner: defaultVerdier(props.nyeBosituasjoner),
        },
        //TODO fiks validering
        //resolver: yupResolver(bosituasjonFormValidation(epsAlder)),
    });
    return (
        <ToKolonner
            tittel={
                <RevurderingsperiodeHeader
                    periode={{
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: DateUtils.toIsoDateOnlyString(props.minDate!),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: DateUtils.toIsoDateOnlyString(props.maxDate!),
                    }}
                />
            }
        >
            {{
                left: (
                    <BosituasjonForm
                        form={form}
                        sakId={props.sakId}
                        revurderingId={props.revurderingId}
                        nesteUrl={props.nesteUrl}
                        forrige={props.forrige}
                        avsluttUrl={props.avsluttUrl}
                        minDate={props.minDate}
                        maxDate={props.maxDate}
                    />
                ),
                right: (
                    <GjeldendeBosituasjon bosituasjon={props.eksisterendeBosituasjoner} formatMessage={formatMessage} />
                ),
            }}
        </ToKolonner>
    );
};

export interface BosituasjonerFormProps {
    form: UseFormReturn<BosituasjonFormData>;
    sakId: string;
    revurderingId: string;
    nesteUrl: string;
    forrige: { url: string; visModal: boolean };
    avsluttUrl: string;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
}

export const BosituasjonForm = (props: BosituasjonerFormProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjonsgrunnlag);
    const history = useHistory();

    const handleSubmit = (data: BosituasjonFormData, gåtil: 'neste' | 'avbryt') =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurderingId,
                bosituasjoner: data.bosituasjoner.map((b) => ({
                    periode: {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        fraOgMed: DateUtils.toIsoDateOnlyString(b.fraOgMed!),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        tilOgMed: DateUtils.toIsoDateOnlyString(b.tilOgMed!),
                    },
                    epsFnr: b.epsFnr,
                    delerBolig: b.delerBolig,
                    erEPSUførFlyktning: b.erEPSUførFlyktning,
                    begrunnelse: b.begrunnelse,
                })),
            },
            () => history.push(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
        );

    const nyBosituasjon = (): BosituasjonFormItemData => ({
        id: uuid(),
        fraOgMed: null,
        tilOgMed: null,
        harEPS: null,
        epsFnr: null,
        delerBolig: null,
        erEPSUførFlyktning: null,
        begrunnelse: null,
    });

    const items = useFieldArray({
        control: props.form.control,
        name: 'bosituasjoner',
    });
    return (
        <form
            className={classNames(sharedStyles.revurderingContainer, styles.container)}
            onSubmit={props.form.handleSubmit((values) => handleSubmit(values, 'neste'))}
        >
            <ul className={styles.periodeliste}>
                {items.fields.map((item, idx) => (
                    <li key={item.id}>
                        <BosituasjonFormItem
                            form={props.form}
                            data={item}
                            index={idx}
                            onDelete={() => items.remove(idx)}
                            minDate={props.minDate}
                            maxDate={props.maxDate}
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
            {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
            {RemoteData.isSuccess(status) && <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />}
            <RevurderingBunnknapper
                tilbake={props.forrige}
                loading={RemoteData.isPending(status)}
                onLagreOgFortsettSenereClick={props.form.handleSubmit((values: BosituasjonFormData) =>
                    handleSubmit(values, 'avbryt')
                )}
            />
        </form>
    );
};

export interface BosituasjonFormData {
    bosituasjoner: BosituasjonFormItemData[];
}

interface BosituasjonFormItemProps {
    form: UseFormReturn<BosituasjonFormData>;
    data: BosituasjonFormItemData;
    index: number;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    onDelete: () => void;
}

export const BosituasjonFormItem = (props: BosituasjonFormItemProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [epsAlder, setEpsAlder] = useState<Nullable<number>>(null);
    const harEPS = props.form.watch(`bosituasjoner.${props.index}.harEPS`);
    return (
        <Panel className={styles.formItemContainer} border>
            <div className={styles.periodeContainer}>
                <div className={styles.periodeContainer}>
                    <Controller
                        name={`bosituasjoner.${props.index}.fraOgMed`}
                        control={props.form.control}
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
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                onChange={(date: Nullable<Date>) => field.onChange(date ? startOfMonth(date) : null)}
                            />
                        )}
                    />
                    <Controller
                        name={`bosituasjoner.${props.index}.tilOgMed`}
                        control={props.form.control}
                        defaultValue={props.data.tilOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label={formatMessage('form.tilOgMed')}
                                id={field.name}
                                feil={getDateErrorMessage(fieldState.error)}
                                {...field}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                onChange={(date: Date) => field.onChange(date ? endOfMonth(date) : date)}
                            />
                        )}
                    />
                </div>
                {props.onDelete && (
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

            <div className={styles.vertical}>
                <Controller
                    control={props.form.control}
                    name={`bosituasjoner.${props.index}.harEPS`}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('form.harSøkerEPS')}
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />
                {harEPS && (
                    <BosituasjonFormItemEps
                        formControl={props.form.control}
                        index={props.index}
                        setEpsAlder={setEpsAlder}
                        epsAlder={epsAlder}
                        formatMessage={formatMessage}
                    />
                )}
                {harEPS === false && (
                    <Controller
                        control={props.form.control}
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
                    control={props.form.control}
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
                <Feiloppsummering
                    tittel={formatMessage('feiloppsummering.title')}
                    className={styles.feiloppsummering}
                    feil={hookFormErrorsTilFeiloppsummering(props.form.formState.errors)}
                    hidden={Object.values(props.form.formState.errors).length <= 0}
                />
            </div>
        </Panel>
    );
};

export interface BosituasjonFormItemEpsProps {
    formControl: Control<BosituasjonFormData>;
    index: number;
    setEpsAlder: (alder: Nullable<number>) => void;
    epsAlder: Nullable<number>;
    formatMessage: MessageFormatter<typeof messages>;
}

export const BosituasjonFormItemEps = (props: BosituasjonFormItemEpsProps) => (
    <div className={styles.epsFormContainer}>
        <Controller
            control={props.formControl}
            name={`bosituasjoner.${props.index}.epsFnr`}
            render={({ field, fieldState }) => (
                <FnrInput
                    label={props.formatMessage('form.epsFnr')}
                    inputId="epsFnr"
                    name={`bosituasjoner.${props.index}.epsFnr`}
                    autoComplete="on"
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

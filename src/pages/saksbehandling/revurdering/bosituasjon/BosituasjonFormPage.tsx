import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Label, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { FnrInput } from '~components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreBosituasjonsgrunnlag } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useAsyncActionCreator } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { RevurderingStegProps } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import { BosituasjonFormData, bosituasjonFormValidation, getDefaultValues } from './bosituasjonForm';
import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';

const BosituasjonFormPage = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [epsAlder, setEpsAlder] = useState<Nullable<number>>(null);
    const history = useHistory();
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjonsgrunnlag);

    const {
        formState: { errors },
        ...form
    } = useForm<BosituasjonFormData>({
        defaultValues: getDefaultValues(props.revurdering, props.grunnlagsdataOgVilkårsvurderinger.bosituasjon),
        resolver: yupResolver(bosituasjonFormValidation(epsAlder)),
    });

    const handleSubmit = (data: BosituasjonFormData, gåtil: 'neste' | 'avbryt') =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                epsFnr: data.harEPS ? data.epsFnr : null,
                erEPSUførFlyktning: data.harEPS && epsAlder && epsAlder < 67 ? data.erEPSUførFlyktning : null,
                delerBolig: data.harEPS ? null : data.delerSøkerBolig,
                begrunnelse: data.begrunnelse,
            },
            () => history.push(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl)
        );

    const harEPS = form.watch('harEPS');

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
                                    legend={formatMessage('form.harSøkerEPS')}
                                    error={fieldState.error?.message}
                                    value={field.value}
                                    onChange={field.onChange}
                                    name={field.name}
                                />
                            )}
                        />
                        {harEPS && (
                            <EPSForm
                                control={form.control}
                                setEpsAlder={setEpsAlder}
                                epsAlder={epsAlder}
                                formatMessage={formatMessage}
                            />
                        )}
                        {harEPS === false && (
                            <Controller
                                control={form.control}
                                name="delerSøkerBolig"
                                render={({ field, fieldState }) => (
                                    <BooleanRadioGroup
                                        legend={formatMessage('form.delerSøkerBolig')}
                                        error={fieldState.error?.message}
                                        value={field.value}
                                        onChange={field.onChange}
                                        name={field.name}
                                    />
                                )}
                            />
                        )}
                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label={formatMessage('form.begrunnelse')}
                                    name="begrunnelse"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    error={fieldState.error}
                                />
                            )}
                        />
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
                            tilbakeUrl={props.forrigeUrl}
                            loading={RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={form.handleSubmit((values) => handleSubmit(values, 'avbryt'))}
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

const GjeldendeBosituasjon = (props: {
    bosituasjon?: Bosituasjon[];
    formatMessage: MessageFormatter<typeof messages>;
}) => {
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {props.formatMessage('eksisterende.vedtakinfo.tittel')}
            </Heading>
            <ul className={styles.grunnlagsliste}>
                {props.bosituasjon?.map((item, index) => (
                    <li key={index}>
                        <Label spacing>{DateUtils.formatPeriode(item.periode)}</Label>
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={props.formatMessage('eksisterende.vedtakinfo.søkerBorMed')}
                            verdi={props.formatMessage(
                                item.fnr
                                    ? 'eksisterende.vedtakinfo.eps'
                                    : item.delerBolig
                                    ? 'eksisterende.vedtakinfo.over18år'
                                    : 'eksisterende.vedtakinfo.enslig'
                            )}
                        />

                        {item.fnr && (
                            <div>
                                <OppsummeringPar
                                    className={styles.informasjonsbitContainer}
                                    label={props.formatMessage('eksisterende.vedtakinfo.eps')}
                                    verdi={item.fnr}
                                />
                                <OppsummeringPar
                                    className={styles.informasjonsbitContainer}
                                    label={props.formatMessage('eksisterende.vedtakinfo.eps')}
                                    verdi={props.formatMessage(
                                        item.ektemakeEllerSamboerUførFlyktning
                                            ? 'eksisterende.vedtakinfo.ja'
                                            : 'eksisterende.vedtakinfo.nei'
                                    )}
                                />
                            </div>
                        )}
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={props.formatMessage('eksisterende.vedtakinfo.sats')}
                            verdi={item.sats}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const EPSForm = (props: {
    control: Control<BosituasjonFormData>;
    setEpsAlder: (alder: Nullable<number>) => void;
    epsAlder: Nullable<number>;
    formatMessage: MessageFormatter<typeof messages>;
}) => (
    <div className={styles.epsFormContainer}>
        <Controller
            control={props.control}
            name="epsFnr"
            render={({ field, fieldState }) => (
                <FnrInput
                    label={props.formatMessage('form.epsFnr')}
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
                        legend={props.formatMessage('form.erEPSUførFlyktning')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        )}
    </div>
);

export default BosituasjonFormPage;

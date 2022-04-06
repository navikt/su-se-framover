import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Label, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { FnrInput } from '~src/components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreBosituasjonsgrunnlag } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedMessages from '../revurdering-nb';
import * as sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import { BosituasjonFormData, bosituasjonFormValidation, getDefaultValues } from './bosituasjonForm';
import messages from './bosituasjonForm-nb';
import * as styles from './bosituasjonForm.module.less';

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
                                    {...field}
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
                                        {...field}
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
                                    description={formatMessage('revurdering.begrunnelse.description')}
                                />
                            )}
                        />
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
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
                    getHentetPerson={(person) => {
                        props.setEpsAlder(person?.alder ?? null);
                    }}
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

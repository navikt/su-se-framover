import { Feiloppsummering, Input, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import ToKolonner from '~components/toKolonner/ToKolonner';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
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

const Bosituasjon = (props: {
    sakId: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: string;
}) => {
    const intl = useI18n({ messages: { ...messages, ...sharedMessages } });

    const {
        formState: { errors, isSubmitted },
        ...form
    } = useForm<BosituasjonFormData>({
        defaultValues: {
            harEPS: null,
            epsFnr: null,
            delerSøkerBolig: null,
            erEPSUførFlyktning: null,
        },
    });

    const handleSubmit = async (data: BosituasjonFormData) => {
        console.log('Submitting: ', data);
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
                        <Radio label="Ja" name="delerSøkerBolig" onChange={() => field.onChange(true)} />
                        <Radio label="Nei" name="delerSøkerBolig" onChange={() => field.onChange(false)} />
                    </RadioGruppe>
                )}
            />
        );
    };

    const EPSForm = () => {
        return (
            <div className={styles.epsFormContainer}>
                <Controller
                    control={form.control}
                    name="epsFnr"
                    render={({ field, fieldState }) => (
                        <div className={styles.epsFnrInputContainer}>
                            <Input
                                label={intl.formatMessage({ id: 'form.epsFnr' })}
                                id="epsFnr"
                                name="epsFnr"
                                autoComplete="on"
                                onChange={field.onChange}
                                value={field.value ?? ''}
                                // Så lenge denne er det eneste på siden sin så ønsker vi at den skal autofokuseres
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                                feil={fieldState.error}
                            />
                        </div>
                    )}
                />
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
                                            <Radio label="Ja" name="harEPS" onChange={() => field.onChange(true)} />
                                            <Radio label="Nei" name="harEPS" onChange={() => field.onChange(false)} />
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
                                hidden={errors && !isSubmitted}
                            />
                            <RevurderingBunnknapper onNesteClick="submit" tilbakeUrl={props.forrigeUrl} />
                        </div>
                    </form>
                ),
                right: <p>Gjeldene bosituasjon kommer inn her</p>,
            }}
        </ToKolonner>
    );
};

export default Bosituasjon;

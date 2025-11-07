import * as RemoteData from '@devexperts/remote-data-ts';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import {
    AlderspensjonPeriodisertFormData,
    nyVurderingsperiodeAlderspensjonMedEllerUtenPeriode,
} from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils';
import messages from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/alderspensjon-nb';
import { VilkårFormProps } from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagFormUtils.ts';
import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes.tsx';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { PensjonsOpplysningerUtvidetSvar } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';

interface Props extends VilkårFormProps<AlderspensjonPeriodisertFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    children?: ReactNode;
}

export const AlderspensjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="alderspensjon"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeAlderspensjonMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: `alderspensjon.${number}`) => (
                        <>
                            <Controller
                                control={props.form.control}
                                name={`${nameAndIdx}.folketrygd`}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('label.folketrygd')}
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    >
                                        <Radio
                                            id={field.name}
                                            value={PensjonsOpplysningerUtvidetSvar.JA}
                                            ref={field.ref}
                                        >
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                            {formatMessage('radio.label.nei')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                            <Controller
                                control={props.form.control}
                                name={`${nameAndIdx}.andreNorske`}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('label.andreNorske')}
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    >
                                        <Radio
                                            id={field.name}
                                            value={PensjonsOpplysningerUtvidetSvar.JA}
                                            ref={field.ref}
                                        >
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                            {formatMessage('radio.label.nei')}
                                        </Radio>
                                        <Radio value={PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT}>
                                            {formatMessage('radio.label.ikkeAktuelt')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                            <Controller
                                control={props.form.control}
                                name={`${nameAndIdx}.utenlandske`}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('label.utenlandske')}
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    >
                                        <Radio
                                            id={field.name}
                                            value={PensjonsOpplysningerUtvidetSvar.JA}
                                            ref={field.ref}
                                        >
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                            {formatMessage('radio.label.nei')}
                                        </Radio>
                                        <Radio value={PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT}>
                                            {formatMessage('radio.label.ikkeAktuelt')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                        </>
                    )}
                    {...props}
                />
                {props.children}
                {RemoteData.isSuccess(props.neste.savingState) && 'feilmeldinger' in props.neste.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.neste.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

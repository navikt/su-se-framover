import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { Utenlandsoppsummering } from '~components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { RevurderingBunnknapper } from '~pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import { StegProps } from '~pages/saksbehandling/revurdering/common';
import stegmessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import sharedStyles from '~pages/saksbehandling/revurdering/revurdering.module.less';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { Revurdering, Utenlandsoppholdstatus } from '~types/Revurdering';

import messages from './utenlandsopphold-nb';

interface UtenlandsoppholdFormData {
    status?: Utenlandsoppholdstatus;
    begrunnelse: Nullable<string>;
}

const schemaValidation = yup.object<UtenlandsoppholdFormData>({
    status: yup.mixed<Utenlandsoppholdstatus>().oneOf(Object.values(Utenlandsoppholdstatus)).required(),
    begrunnelse: yup.string().nullable().defined(),
});

const Utenlandsopphold = (props: StegProps) => {
    const { formatMessage } = useI18n({ messages: { ...stegmessages, ...messages } });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const form = useForm<UtenlandsoppholdFormData>({
        resolver: yupResolver(schemaValidation),
        defaultValues: {
            status: props.revurdering.grunnlagsdataOgVilkårsvurderinger.oppholdIUtlandet.status,
            begrunnelse: props.revurdering.grunnlagsdataOgVilkårsvurderinger.oppholdIUtlandet.begrunnelse ?? null,
        },
    });
    const [status, setStatus] = React.useState<
        RemoteData.RemoteData<ApiError, { revurdering: Revurdering; feilmeldinger: ErrorMessage[] }>
    >(RemoteData.initial);
    const [trykketKnapp, setTrykketKnapp] = useState<'neste' | 'hjem' | undefined>(undefined);

    const handleSubmit = async (form: UtenlandsoppholdFormData, gåtil: 'neste' | 'hjem') => {
        setTrykketKnapp(gåtil);
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.lagreUtenlandsopphold({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                status: form.status!,
                begrunnelse: form.begrunnelse,
            })
        );

        if (revurderingActions.lagreUtenlandsopphold.fulfilled.match(res)) {
            setStatus(RemoteData.success(res.payload));
            if (res.payload.feilmeldinger.length === 0) {
                history.push(
                    gåtil === 'neste' ? props.nesteUrl : Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })
                );
            }
        }
        if (revurderingActions.lagreUtenlandsopphold.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setStatus(RemoteData.failure(res.payload!));
        }
    };

    return (
        <ToKolonner tittel={formatMessage(RevurderingSteg.Utenlandsopphold)}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={form.handleSubmit((values) => handleSubmit(values, 'neste'))}
                    >
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    legend={formatMessage('radiobutton.tittel')}
                                    error={fieldState.error?.message}
                                    {...field}
                                >
                                    <Radio value={Utenlandsoppholdstatus.Utenlands} ref={field.ref}>
                                        {formatMessage('radiobutton.utenlands')}
                                    </Radio>
                                    <Radio value={Utenlandsoppholdstatus.Innenlands}>
                                        {formatMessage('radiobutton.innenlands')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field: { value, ...field }, fieldState }) => (
                                <Textarea
                                    label={formatMessage('input.begrunnelse.tittel')}
                                    error={fieldState.error?.message}
                                    value={value ?? ''}
                                    {...field}
                                />
                            )}
                        />
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <RevurderingBunnknapper
                            onNesteClick="submit"
                            tilbakeUrl={props.forrigeUrl}
                            onNesteClickSpinner={trykketKnapp === 'neste' && RemoteData.isPending(status)}
                            onLagreOgFortsettSenereClick={form.handleSubmit((values) => handleSubmit(values, 'hjem'))}
                            onLagreOgFortsettSenereClickSpinner={
                                trykketKnapp === 'hjem' && RemoteData.isPending(status)
                            }
                        />
                    </form>
                ),
                right: (
                    <div>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        <Utenlandsoppsummering
                            oppholdIUtlandet={props.grunnlagsdataOgVilkårsvurderinger.oppholdIUtlandet}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Utenlandsopphold;

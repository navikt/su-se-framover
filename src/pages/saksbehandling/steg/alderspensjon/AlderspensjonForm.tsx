import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import * as RemoteData from '~node_modules/@devexperts/remote-data-ts';
import { yupResolver } from '~node_modules/@hookform/resolvers/yup/dist/yup';
import { Radio, RadioGroup } from '~node_modules/@navikt/ds-react';
import { Controller, useForm } from '~node_modules/react-hook-form';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { RevurderingBunnknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import messages from '~src/pages/saksbehandling/steg/alderspensjon/alderspensjon-nb';
import { FormData, schema } from '~src/pages/saksbehandling/steg/alderspensjon/types';
import * as styles from '~src/pages/saksbehandling/steg/uføre/uførhet.module.less';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Behandling } from '~src/types/Behandling';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';

interface Props extends VilkårsvurderingBaseProps {
    save: (values: FormData, onSuccess: () => void) => void;
    savingState: ApiResult<Behandling>;
    avsluttUrl: string;
}

export const AlderspensjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const form = useForm<FormData>({
        defaultValues: {
            harSøktAlderspensjon:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.alder?.vurderinger.harSøktAlderspensjon ?? null,
        },
        resolver: yupResolver(schema),
    });

    return (
        <form onSubmit={form.handleSubmit((values) => props.save(values, () => navigate(props.nesteUrl)))}>
            <Controller
                control={form.control}
                name={'harSøktAlderspensjon'}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        legend={formatMessage('label.harSøktAlderspensjon')}
                        error={fieldState.error?.message}
                        value={field.value ?? ''}
                    >
                        <Radio id={field.name} value={Aldersresultat.VilkårOppfylt} ref={field.ref}>
                            {formatMessage('radio.label.ja')}
                        </Radio>
                        <Radio value={Aldersresultat.VilkårIkkeOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                        <Radio value={Aldersresultat.HarAlderssakTilBehandling}>
                            {formatMessage('radio.label.alderssakTilBehandling')}
                        </Radio>
                    </RadioGroup>
                )}
            />
            <Feiloppsummering
                tittel={formatMessage('feiloppsummering.title')}
                className={styles.feiloppsummering}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringRef}
            />
            {RemoteData.isFailure(props.savingState) && <ApiErrorAlert error={props.savingState.error} />}
            <RevurderingBunnknapper
                tilbake={{ url: props.forrigeUrl, visModal: false }}
                onLagreOgFortsettSenereClick={form.handleSubmit((values: FormData) =>
                    props.save(values, () => navigate(props.avsluttUrl))
                )}
                loading={RemoteData.isPending(props.savingState)}
            />
        </form>
    );
};

import * as React from 'react';
import { ReactElement } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as RemoteData from '~node_modules/@devexperts/remote-data-ts';
import { FieldValues } from '~node_modules/react-hook-form/dist/types/fields';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/Navigasjonsknapper';
import * as styles from '~src/pages/saksbehandling/steg/uføre/uførhet.module.less';
import stegSharedI18n from '~src/pages/søknad/steg/steg-shared-i18n';
import { Behandling } from '~src/types/Behandling';

interface Props<T, U> {
    form: UseFormReturn<T>;
    save: (values: T, onSuccess: (res?: U) => void) => void;
    savingState: ApiResult<unknown>;
    onSuccess?: (res: U) => void;
    avsluttUrl: string;
    forrigeUrl: string;
    nesteUrl: string;
    visModal?: boolean;
    children: ReactElement;
    nesteKnappTekst?: string;
}

export const SøknadsbehandlingWrapper = <T extends FieldValues, U extends Behandling>({
    form,
    ...props
}: Props<T, U>) => {
    const { formatMessage } = useI18n({ messages: stegSharedI18n });
    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    return (
        <form
            onSubmit={form.handleSubmit<T>((values) =>
                props.save(values, (res) => {
                    props.onSuccess && res ? props.onSuccess(res) : navigate(props.nesteUrl);
                })
            )}
        >
            {props.children}
            <Feiloppsummering
                tittel={formatMessage('feiloppsummering.title')}
                className={styles.feiloppsummering}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringRef}
            />
            {RemoteData.isFailure(props.savingState) && <ApiErrorAlert error={props.savingState.error} />}
            <Navigasjonsknapper
                tilbake={{ url: props.forrigeUrl, visModal: props.visModal ?? false }}
                onLagreOgFortsettSenereClick={form.handleSubmit<T>((values) =>
                    props.save(values, () => navigate(props.avsluttUrl))
                )}
                loading={RemoteData.isPending(props.savingState)}
                nesteKnappTekst={props.nesteKnappTekst}
            />
        </form>
    );
};

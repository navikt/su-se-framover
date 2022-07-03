import * as RemoteData from '@devexperts/remote-data-ts';
import * as React from 'react';
import { ReactElement } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types/fields';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';
import stegSharedI18n from '~src/pages/søknad/steg/steg-shared-i18n';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import * as styles from './søknadsbehandlingWrapper.module.less';

interface Props<T, U> {
    form: UseFormReturn<T>;
    save: (values: T, onSuccess: (res?: U) => void) => void;
    savingState: ApiResult<unknown>;
    onSuccess?: (res: U) => void;
    avsluttUrl: string;
    forrigeUrl: string;
    onTilbakeClickOverride?: () => void;
    nesteUrl: string;
    children: ReactElement;
    nesteKnappTekst?: string;
    className?: string;
}

export const FormWrapper = <T extends FieldValues, U extends Søknadsbehandling>({ form, ...props }: Props<T, U>) => {
    const { formatMessage } = useI18n({ messages: stegSharedI18n });
    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const tilbake = props.onTilbakeClickOverride
        ? { onTilbakeClick: props.onTilbakeClickOverride }
        : { url: props.forrigeUrl };

    return (
        <form
            className={props.className ?? ''}
            onSubmit={form.handleSubmit((values) =>
                props.save(values, (res) => {
                    props.onSuccess && res ? props.onSuccess(res) : navigate(props.nesteUrl);
                })
            )}
        >
            <div className={styles.containerElement}>{props.children}</div>
            <Feiloppsummering
                tittel={formatMessage('feiloppsummering.title')}
                className={styles.feiloppsummering}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringRef}
            />
            {RemoteData.isFailure(props.savingState) && <ApiErrorAlert error={props.savingState.error} />}
            <Navigasjonsknapper
                tilbake={tilbake}
                onLagreOgFortsettSenereClick={form.handleSubmit((values) =>
                    props.save(values, () => navigate(props.avsluttUrl))
                )}
                loading={RemoteData.isPending(props.savingState)}
                nesteKnappTekst={props.nesteKnappTekst}
            />
        </form>
    );
};

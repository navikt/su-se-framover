import * as RemoteData from '@devexperts/remote-data-ts';
import { ReactElement } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import stegSharedI18n from '~src/pages/søknad/steg/steg-shared-i18n';
import { Behandling } from '~src/types/Behandling';

import styles from './søknadsbehandlingWrapper.module.less';

interface Props<T extends FieldValues, U> {
    form: UseFormReturn<T>;
    children: ReactElement;
    className?: string;
    neste: {
        url?: string;
        tekst?: string;
        onClick: (values: T, onSuccess: (res?: U) => void) => void;
        savingState: ApiResult<unknown>;
        onSuccess?: (res: U) => void;
    };
    tilbake: {
        url?: string;
        onClick?: () => void;
    };
    lagreOgfortsettSenere?: {
        chainNesteKall?: boolean;
        loading?: boolean;
        url: string;
        onClick?: (values: T, onSuccess: (res?: U) => void) => void;
    };
    fortsettSenere?: {
        onClick: () => void;
        tekst?: string;
    };
}

/**
 *
 * @param chainNesteKall i `lagreOgFortsettSenere` blir kun tatt stilling til dersom det sendes med en onClick
 */
export const FormWrapper = <T extends FieldValues, U extends Behandling>({ form, ...props }: Props<T, U>) => {
    const { formatMessage } = useI18n({ messages: stegSharedI18n });

    const navigate = useNavigate();
    const lagreOgFortsettSenereMedNeste = (values: T) =>
        props.lagreOgfortsettSenere!.onClick!(values, () =>
            props.neste.onClick(values, () => navigate(props.lagreOgfortsettSenere!.url)),
        );
    const lagreOgFortsettSenereUtenNeste = (values: T) =>
        props.lagreOgfortsettSenere!.onClick!(values, () => navigate(props.lagreOgfortsettSenere!.url));
    const lagreOgFortsettSenereUtenOnClick = (values: T) =>
        props.neste.onClick!(values, () => navigate(props.lagreOgfortsettSenere!.url));
    return (
        <form
            className={props.className ?? ''}
            onSubmit={form.handleSubmit((values) => {
                return props.neste.onClick(values, (res) => {
                    if (props.neste.onSuccess && res) {
                        props.neste.onSuccess(res);
                    } else if (props.neste?.url) {
                        navigate(props.neste.url);
                    }
                });
            })}
        >
            <div className={styles.containerElement}>{props.children}</div>
            <Feiloppsummering
                tittel={formatMessage('feiloppsummering.title')}
                className={styles.feiloppsummering}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
            />
            {RemoteData.isFailure(props.neste.savingState) && <ApiErrorAlert error={props.neste.savingState.error} />}
            <Navigasjonsknapper
                neste={{
                    loading: RemoteData.isPending(props.neste.savingState),
                    tekst: props.neste?.tekst,
                }}
                tilbake={props.tilbake}
                fortsettSenere={
                    props.lagreOgfortsettSenere
                        ? {
                              onClick: form.handleSubmit((values) =>
                                  props.lagreOgfortsettSenere?.onClick
                                      ? props.lagreOgfortsettSenere?.chainNesteKall
                                          ? lagreOgFortsettSenereMedNeste(values)
                                          : lagreOgFortsettSenereUtenNeste(values)
                                      : lagreOgFortsettSenereUtenOnClick(values),
                              ),
                          }
                        : props.fortsettSenere
                          ? {
                                onClick: props.fortsettSenere.onClick,
                                tekst: props.fortsettSenere?.tekst,
                            }
                          : undefined
                }
            />
        </form>
    );
};

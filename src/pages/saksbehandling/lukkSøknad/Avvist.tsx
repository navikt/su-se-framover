import * as RemoteData from '@devexperts/remote-data-ts';
import { FormikErrors } from 'formik';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { RadioPanelGruppe, Textarea } from 'nav-frontend-skjema';
import React, { useCallback } from 'react';

import { ApiError } from '~api/apiClient';
import { JaNeiSpørsmål } from '~components/FormElements';
import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch } from '~redux/Store';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import { AvvistBrevtyper } from './lukkSøknadUtils';

interface AvvistFormData {
    sendBrevForAvvist: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

interface AvvistProps {
    søknadId: string;
    lukkSøknadBegrunnelse: LukkSøknadBegrunnelse;
    avvistFormData: AvvistFormData;
    lukketSøknadBrevutkastStatus: RemoteData.RemoteData<ApiError, null>;
    søknadLukketStatus: RemoteData.RemoteData<ApiError, null>;
    feilmeldinger: FormikErrors<AvvistFormData>;
    onValueChange: (value: AvvistFormData) => void;
}

const Avvist = (props: AvvistProps) => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const intl = useI18n({ messages: nb });

    const onSeBrevClick = useCallback(() => {
        if (
            RemoteData.isPending(props.lukketSøknadBrevutkastStatus) ||
            props.lukkSøknadBegrunnelse !== LukkSøknadBegrunnelse.Avvist ||
            !props.avvistFormData.typeBrev
        ) {
            return;
        }
        dispatch(
            hentLukketSøknadBrevutkast({
                søknadId: urlParams.soknadId,
                body: {
                    type: props.lukkSøknadBegrunnelse,
                    brevConfig: props.avvistFormData.typeBrev
                        ? {
                              brevtype: props.avvistFormData.typeBrev,
                              fritekst: props.avvistFormData.fritekst,
                          }
                        : null,
                },
            })
        ).then((action) => {
            if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [props]);

    return (
        <div className={styles.avvistContainer}>
            <div className={styles.radioContainer}>
                <JaNeiSpørsmål
                    id={'sendBrevForAvvist'}
                    legend={intl.formatMessage({ id: 'display.avvist.sendBrevTilSøker' })}
                    feil={props.feilmeldinger.sendBrevForAvvist}
                    state={props.avvistFormData.sendBrevForAvvist}
                    onChange={(val) => {
                        props.onValueChange({ sendBrevForAvvist: val, typeBrev: null, fritekst: null });
                    }}
                />
            </div>
            {props.avvistFormData.sendBrevForAvvist && (
                <div className={styles.radioContainer}>
                    <RadioPanelGruppe
                        name={'typeBrev'}
                        legend={intl.formatMessage({ id: 'display.avvist.typeBrev' })}
                        radios={[
                            {
                                label: intl.formatMessage({ id: 'display.avvist.brevType.vedtaksbrev' }),
                                value: AvvistBrevtyper.Vedtaksbrev,
                                id: AvvistBrevtyper.Vedtaksbrev,
                            },
                            {
                                label: intl.formatMessage({ id: 'display.avvist.brevType.fritekstbrev' }),
                                value: AvvistBrevtyper.Fritekstsbrev,
                                id: AvvistBrevtyper.Fritekstsbrev,
                            },
                        ]}
                        checked={props.avvistFormData.typeBrev ?? undefined}
                        onChange={(e) => {
                            props.onValueChange({
                                ...props.avvistFormData,
                                typeBrev: (e as React.ChangeEvent<HTMLInputElement>).target.value as AvvistBrevtyper,
                            });
                        }}
                    />
                </div>
            )}
            {props.avvistFormData.typeBrev && (
                <div className={styles.textAreaContainer}>
                    <Textarea
                        label={intl.formatMessage({ id: 'display.avvist.fritekst' })}
                        name="fritekst"
                        value={props.avvistFormData.fritekst ?? ''}
                        feil={props.feilmeldinger.fritekst}
                        onChange={(e) => props.onValueChange({ ...props.avvistFormData, fritekst: e.target.value })}
                    />
                </div>
            )}
            <div className={styles.buttonsContainer}>
                {props.avvistFormData.sendBrevForAvvist && (
                    <Knapp
                        className={styles.seBrevKnapp}
                        htmlType="button"
                        onClick={() => {
                            onSeBrevClick();
                        }}
                        spinner={RemoteData.isPending(props.lukketSøknadBrevutkastStatus)}
                    >
                        {intl.formatMessage({ id: 'knapp.seBrev' })}
                    </Knapp>
                )}
                <Fareknapp spinner={RemoteData.isPending(props.søknadLukketStatus)}>
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                </Fareknapp>
            </div>
        </div>
    );
};

export default Avvist;

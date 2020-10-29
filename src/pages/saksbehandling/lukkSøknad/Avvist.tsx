import * as RemoteData from '@devexperts/remote-data-ts';
import { FormikErrors } from 'formik';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { RadioPanelGruppe, Textarea } from 'nav-frontend-skjema';
import React, { SetStateAction, SyntheticEvent, useCallback } from 'react';

import { JaNeiSpørsmål } from '~components/FormElements';
import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { LukkSøknadType } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import { AvvistBrevtyper, LukkSøknadFormData, setAvvistBrevConfigBody } from './lukkSøknadUtils';

const Avvist = (props: {
    values: LukkSøknadFormData;
    errors: FormikErrors<LukkSøknadFormData>;
    setValues: (values: SetStateAction<LukkSøknadFormData>, shouldValidate?: boolean | undefined) => unknown;
    handleChange: (event: React.ChangeEvent<HTMLTextAreaElement> | SyntheticEvent<EventTarget, Event>) => void;
}) => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const intl = useI18n({ messages: nb });

    const { lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);

    const avvistSøknadBrev = useCallback(() => {
        if (RemoteData.isPending(lukketSøknadBrevutkastStatus)) {
            return;
        }
        if (
            props.values.lukkSøknadType === LukkSøknadType.Avvist &&
            props.values.sendBrevForAvvist &&
            props.values.typeBrev
        ) {
            dispatch(
                hentLukketSøknadBrevutkast({
                    søknadId: urlParams.soknadId,
                    lukketSøknadType: props.values.lukkSøknadType,
                    body: {
                        type: props.values.lukkSøknadType.toUpperCase(),
                        brevConfig: setAvvistBrevConfigBody(props.values),
                    },
                })
            ).then((action) => {
                if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                    window.open(action.payload.objectUrl);
                }
            });
        }
    }, [props.values]);

    return (
        <div className={styles.avvistContainer}>
            <div className={styles.radioContainer}>
                <JaNeiSpørsmål
                    id={'sendBrevForAvvist'}
                    legend={intl.formatMessage({ id: 'display.avvist.sendBrevTilSøker' })}
                    feil={props.errors.sendBrevForAvvist}
                    state={props.values.sendBrevForAvvist}
                    onChange={(val) => {
                        props.setValues({ ...props.values, sendBrevForAvvist: val, typeBrev: null, fritekst: null });
                    }}
                />
            </div>
            {props.values.sendBrevForAvvist && (
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
                        checked={props.values.typeBrev ?? undefined}
                        onChange={(e) => {
                            props.setValues({ ...props.values, fritekst: null });
                            props.handleChange(e);
                        }}
                    />
                </div>
            )}
            {props.values.typeBrev === AvvistBrevtyper.Fritekstsbrev && (
                <div className={styles.textAreaContainer}>
                    <Textarea
                        label={intl.formatMessage({ id: 'display.avvist.fritekst' })}
                        name="fritekst"
                        value={props.values.fritekst ?? ''}
                        feil={props.errors.fritekst}
                        onChange={props.handleChange}
                    />
                </div>
            )}
            <div className={styles.buttonsContainer}>
                {props.values.sendBrevForAvvist && (
                    <Knapp
                        className={styles.seBrevKnapp}
                        htmlType="button"
                        onClick={() => {
                            avvistSøknadBrev();
                        }}
                        spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}
                    >
                        {intl.formatMessage({ id: 'knapp.seBrev' })}
                    </Knapp>
                )}
                <Fareknapp spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}>
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                </Fareknapp>
            </div>
        </div>
    );
};

export default Avvist;

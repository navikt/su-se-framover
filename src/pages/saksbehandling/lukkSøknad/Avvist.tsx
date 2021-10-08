import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader, RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { FormikErrors } from 'formik';
import React, { useCallback } from 'react';

import { ApiError } from '~api/apiClient';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch } from '~redux/Store';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import { AvvistBrevtyper, LukkSøknadFormData } from './lukkSøknadUtils';

interface AvvistFormData {
    sendBrevForAvvist: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

interface AvvistProps {
    lukkSøknadBegrunnelse: LukkSøknadBegrunnelse;
    validateForm: () => Promise<FormikErrors<LukkSøknadFormData>>;
    avvistFormData: AvvistFormData;
    lukketSøknadBrevutkastStatus: RemoteData.RemoteData<ApiError, null>;
    søknadLukketStatus: RemoteData.RemoteData<ApiError, null>;
    feilmeldinger: FormikErrors<AvvistFormData>;
    onValueChange: (value: AvvistFormData) => void;
}

const Avvist = (props: AvvistProps) => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const { intl } = useI18n({ messages: nb });

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
                <BooleanRadioGroup
                    name="sendBrevForAvvist"
                    legend={intl.formatMessage({ id: 'display.avvist.sendBrevTilSøker' })}
                    error={props.feilmeldinger.sendBrevForAvvist}
                    value={props.avvistFormData.sendBrevForAvvist}
                    onChange={(val) => {
                        props.onValueChange({ sendBrevForAvvist: val, typeBrev: null, fritekst: null });
                    }}
                />
            </div>
            {props.avvistFormData.sendBrevForAvvist && (
                <div className={styles.radioContainer}>
                    <RadioGroup
                        name="typeBrev"
                        legend={intl.formatMessage({ id: 'display.avvist.typeBrev' })}
                        value={props.avvistFormData.typeBrev?.toString()}
                        onChange={(val) => {
                            props.onValueChange({
                                ...props.avvistFormData,
                                typeBrev: val as AvvistBrevtyper,
                            });
                        }}
                    >
                        <Radio id="typeBrev" value={AvvistBrevtyper.Vedtaksbrev}>
                            {intl.formatMessage({ id: 'display.avvist.brevType.vedtaksbrev' })}
                        </Radio>
                        <Radio value={AvvistBrevtyper.Fritekstsbrev}>
                            {intl.formatMessage({ id: 'display.avvist.brevType.fritekstbrev' })}
                        </Radio>
                    </RadioGroup>
                </div>
            )}
            {props.avvistFormData.typeBrev && (
                <div className={styles.textAreaContainer}>
                    <Textarea
                        label={intl.formatMessage({ id: 'display.avvist.fritekst' })}
                        name="fritekst"
                        value={props.avvistFormData.fritekst ?? ''}
                        error={props.feilmeldinger.fritekst}
                        onChange={(e) => props.onValueChange({ ...props.avvistFormData, fritekst: e.target.value })}
                    />
                </div>
            )}
            <div className={styles.buttonsContainer}>
                {props.avvistFormData.sendBrevForAvvist && (
                    <Button
                        variant="secondary"
                        className={styles.seBrevKnapp}
                        type="button"
                        onClick={() => {
                            props.validateForm().then((res) => {
                                if (Object.keys(res).length === 0) {
                                    onSeBrevClick();
                                }
                            });
                        }}
                    >
                        {intl.formatMessage({ id: 'knapp.seBrev' })}
                        {RemoteData.isPending(props.lukketSøknadBrevutkastStatus) && <Loader />}
                    </Button>
                )}
                <Button variant="danger">
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                    {RemoteData.isPending(props.søknadLukketStatus) && <Loader />}
                </Button>
            </div>
        </div>
    );
};

export default Avvist;

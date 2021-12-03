import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader, RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import React from 'react';
import { FieldErrors } from 'react-hook-form';

import * as søknadApi from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import { AvvistBrevtyper } from './lukkSøknadUtils';

interface AvvistFormData {
    skalSendesBrev: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

interface AvvistProps {
    søknadId: string;
    avvistFormData: AvvistFormData;
    feilmeldinger?: FieldErrors<AvvistFormData>;
    onValueChange: (value: AvvistFormData) => void;
    onRequestValidate: (onSuccess: () => void) => void;
}

const Avvist = (props: AvvistProps) => {
    const { formatMessage } = useI18n({ messages: nb });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(søknadApi.hentLukketSøknadsBrevutkast);

    const handleHentBrevClick = () => {
        props.onRequestValidate(() => {
            hentBrev({
                søknadId: props.søknadId,
                body: {
                    type: LukkSøknadBegrunnelse.Avvist,
                    brevConfig: props.avvistFormData.typeBrev
                        ? {
                              brevtype: props.avvistFormData.typeBrev,
                              fritekst: props.avvistFormData.fritekst,
                          }
                        : null,
                },
            });
        });
    };

    return (
        <div className={styles.avvistContainer}>
            <div className={styles.radioContainer}>
                <BooleanRadioGroup
                    name="skalSendesBrev"
                    legend={formatMessage('avvist.skalSendesBrevTilSøker')}
                    error={props.feilmeldinger?.skalSendesBrev?.message}
                    value={props.avvistFormData.skalSendesBrev}
                    onChange={(val) => {
                        props.onValueChange({ skalSendesBrev: val, typeBrev: null, fritekst: null });
                    }}
                />
            </div>
            {props.avvistFormData.skalSendesBrev && (
                <div className={styles.radioContainer}>
                    <RadioGroup
                        name="typeBrev"
                        legend={formatMessage('avvist.typeBrev')}
                        value={props.avvistFormData.typeBrev?.toString()}
                        onChange={(val) => {
                            props.onValueChange({
                                ...props.avvistFormData,
                                typeBrev: val as AvvistBrevtyper,
                            });
                        }}
                        error={props.feilmeldinger?.typeBrev?.message}
                    >
                        <Radio id="typeBrev" value={AvvistBrevtyper.Vedtaksbrev}>
                            {formatMessage('avvist.brevType.vedtaksbrev')}
                        </Radio>
                        <Radio value={AvvistBrevtyper.Fritekstsbrev}>
                            {formatMessage('avvist.brevType.fritekstbrev')}
                        </Radio>
                    </RadioGroup>
                </div>
            )}
            {props.avvistFormData.typeBrev === AvvistBrevtyper.Fritekstsbrev && (
                <div className={styles.textAreaContainer}>
                    <Textarea
                        label={formatMessage('avvist.fritekst')}
                        name="fritekst"
                        value={props.avvistFormData.fritekst ?? ''}
                        error={props.feilmeldinger?.fritekst?.message}
                        onChange={(e) => props.onValueChange({ ...props.avvistFormData, fritekst: e.target.value })}
                    />
                </div>
            )}
            {props.avvistFormData.skalSendesBrev !== null && (
                <div className={styles.buttonsContainer}>
                    {props.avvistFormData.skalSendesBrev && (
                        <Button
                            variant="secondary"
                            className={styles.seBrevKnapp}
                            type="button"
                            onClick={handleHentBrevClick}
                        >
                            {formatMessage('knapp.seBrev')}
                            {RemoteData.isPending(brevStatus) && <Loader />}
                        </Button>
                    )}
                </div>
            )}
            <div>{RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}</div>
        </div>
    );
};

export default Avvist;

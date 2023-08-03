import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Search } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { validate as uuidValidate } from 'uuid';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { pipe } from '~src/lib/fp';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup from '~src/lib/validering';
import { Person } from '~src/types/Person';
import { removeSpaces } from '~src/utils/format/formatUtils';

import { Personkort } from '../personkort/Personkort';

import messages from './personsøk-nb';
import * as styles from './personsøk.module.less';

interface Props {
    person: ApiResult<Person>;
    onFetchByFnr: (fnr: string) => void;
    onFetchBySaksnummer?: (saksnummer: string) => void;
    onFetchBySakId?: (sakId: string) => void;
    onReset: () => void;
}
interface PersonSøkFormData {
    fnr: string;
}

const personSøkSchema = yup.object<PersonSøkFormData>({
    fnr: yup.string().required().typeError('Ugyldig input'),
});

/**
 * Er vel teknisk sett også sakSøk :thinkies: burde endre litt her
 */
const Personsøk = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const { control, handleSubmit } = useForm<PersonSøkFormData>({
        defaultValues: { fnr: '' },
        resolver: yupResolver(personSøkSchema),
    });

    const submitHandler = (formData: PersonSøkFormData) => {
        props.onReset();

        //fnr alltid 11 siffer
        const isFnr = removeSpaces(formData.fnr).length === 11;
        const isId = uuidValidate(formData.fnr);

        if (isFnr) {
            props.onFetchByFnr(formData.fnr);
        } else if (isId) {
            props.onFetchBySakId?.(formData.fnr);
            return;
        } else {
            props.onFetchBySaksnummer?.(formData.fnr);
        }
    };

    useEffect(() => {
        props.onReset();
    }, []);

    return (
        <div className={styles.personsøk}>
            <form onSubmit={handleSubmit(submitHandler)}>
                <Controller
                    control={control}
                    name="fnr"
                    render={({ field, fieldState }) => (
                        <Search
                            value={field.value}
                            onChange={field.onChange}
                            label={
                                props.onFetchBySaksnummer
                                    ? `${formatMessage('input.fnr.label')} / ${formatMessage('input.fnr.saksnummer')}`
                                    : formatMessage('input.fnr.label')
                            }
                            onClear={props.onReset}
                            type="primary"
                            error={fieldState.error?.message}
                        >
                            <Search.Button loading={RemoteData.isPending(props.person)}>
                                {formatMessage('knapp.søk')}
                            </Search.Button>
                        </Search>
                    )}
                />
            </form>
            <div className={styles.personkortWrapper}>
                {pipe(
                    props.person,
                    RemoteData.fold(
                        () => null,
                        () => null,
                        (err) => <ApiErrorAlert error={err} />,
                        (s) => <Personkort person={s} />,
                    ),
                )}
            </div>
        </div>
    );
};

export default Personsøk;

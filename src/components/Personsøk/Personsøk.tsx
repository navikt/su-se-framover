import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Search } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
    onReset: () => void;
}
interface PersonSøkFormData {
    fnr: string;
}

const personSøkSchema = yup.object<PersonSøkFormData>({
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - integer() er lagt til i validering.ts, men typescript fortår seg ikke på det
    fnr: yup.string().integer().required().typeError('Ugyldig fødselsnummer'),
});

const Personsøk = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const { control, handleSubmit } = useForm<PersonSøkFormData>({
        defaultValues: { fnr: '' },
        resolver: yupResolver(personSøkSchema),
    });

    const submitHandler = (formData: PersonSøkFormData) => {
        props.onReset();

        const strippedSearch = removeSpaces(formData.fnr);

        !props.onFetchBySaksnummer || strippedSearch.length === 11
            ? props.onFetchByFnr(strippedSearch)
            : props.onFetchBySaksnummer?.(strippedSearch);
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

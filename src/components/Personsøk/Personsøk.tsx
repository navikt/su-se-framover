import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { BodyShort, Button, Loader, Search, VStack } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~src/features/saksoversikt/sak.slice.ts';
import { pipe } from '~src/lib/fp';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes.ts';
import yup from '~src/lib/validering';
import { Person } from '~src/types/Person';
import { removeSpaces } from '~src/utils/format/formatUtils';

import { Personkort } from '../personkort/Personkort';

import messages from './personsøk-nb';
import styles from './personsøk.module.less';

interface Props {
    person: ApiResult<Person>;
    onFetchByFnr?: (fnr: string) => void; //TODO: burde fjernes
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

const Personsøk = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const { control, handleSubmit } = useForm<PersonSøkFormData>({
        defaultValues: { fnr: '' },
        resolver: yupResolver(personSøkSchema),
    });

    const [sakfnrstatus, fetchsakfnr, resetsakfnr] = useAsyncActionCreator(sakSlice.fetchSakByFnr);

    const submitHandler = async (formData: PersonSøkFormData) => {
        props.onReset();
        resetsakfnr();

        //fnr alltid 11 siffer
        const isFnr = removeSpaces(formData.fnr).length === 11;
        const isId = uuidValidate(formData.fnr);

        if (isFnr) {
            if (props.onFetchByFnr) {
                //Legacy
                props.onFetchByFnr(formData.fnr);
            } else {
                /*
                    Hvis bare en sak navigerer vi direkte til den, ellers lar vi sb velge hvilken de vil gå til
                 */
                await fetchsakfnr({ fnr: formData.fnr });
                if (RemoteData.isSuccess(sakfnrstatus)) {
                    if (sakfnrstatus.value.length === 1) {
                        navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sakfnrstatus.value[0].id }));
                    }
                }
            }
        } else if (isId) {
            props.onFetchBySakId?.(formData.fnr);
            return;
        } else {
            props.onFetchBySaksnummer?.(formData.fnr);
        }
    };

    useEffect(() => {
        if (RemoteData.isSuccess(sakfnrstatus) && sakfnrstatus.value.length === 1) {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sakfnrstatus.value[0].id }));
        }
    }, [sakfnrstatus]);

    useEffect(() => {
        props.onReset();
        resetsakfnr();
    }, []);

    return (
        <>
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
                                variant="primary"
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
            {RemoteData.isSuccess(sakfnrstatus) && (
                <>
                    <BodyShort>Velg hvilken sak du vil gå til</BodyShort>
                    <VStack gap="2">
                        {sakfnrstatus.value.map((sak) => (
                            <div key={sak.id}>
                                <p>Saksnummer {sak.saksnummer}</p>
                                <Button
                                    key={sak.id}
                                    onClick={() => {
                                        navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }));
                                    }}
                                >
                                    Gå til sakstype {sak.sakstype}
                                </Button>
                            </div>
                        ))}
                    </VStack>
                </>
            )}
            {RemoteData.isPending(sakfnrstatus) && <Loader />}
            {RemoteData.isFailure(sakfnrstatus) && <ApiErrorAlert error={sakfnrstatus.error} />}
        </>
    );
};

export default Personsøk;

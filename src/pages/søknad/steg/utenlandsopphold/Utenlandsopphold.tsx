import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { guid } from 'nav-frontend-js-utils';
import { useFormik } from 'formik';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import TextProvider, { Languages } from '~components/TextProvider';
import messages from './utenlandsopphold-nb';
import Datovelger from 'nav-datovelger/dist/datovelger/Datovelger';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { Nullable } from '~lib/types';

interface FormData {
    harReistTilUtlandetSiste90dager: Nullable<boolean>;
    harReistDatoer: Array<{ utreisedato: string; innreisedato: string }>;
    skalReiseTilUtlandetNeste12Måneder: Nullable<boolean>;
    skalReiseDatoer: Array<{ utreisedato: string; innreisedato: string }>;
}

const MultiTidsperiodevelger = (props: {
    perioder: Array<{ utreisedato: string; innreisedato: string }>;
    onChange: (element: { index: number; utreisedato: string; innreisedato: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div>
            {props.perioder.map((periode, index) => (
                <div className={sharedStyles.inputFelterDiv} key={guid()}>
                    <div className={sharedStyles.inputFelt}>
                        <label>Utreisedato</label>
                        <Datovelger
                            input={{
                                name: 'utreisedato',
                                placeholder: 'dd.mm.åååå',
                                id: `${index}-harReist-utreisedato`
                            }}
                            valgtDato={periode.utreisedato}
                            id={`${index}-harReist-utreisedato`}
                            onChange={value =>
                                props.onChange({ index, utreisedato: value, innreisedato: periode.innreisedato })
                            }
                        />
                    </div>

                    <div className={sharedStyles.inputFelt}>
                        <label>Innreisedato</label>
                        <Datovelger
                            input={{
                                name: 'innreisedato',
                                placeholder: 'dd.mm.åååå',
                                id: `${index}-harReist-innreisedato`
                            }}
                            valgtDato={periode.innreisedato}
                            id={`${index}-harReist-innreisedato`}
                            onChange={value =>
                                props.onChange({ index, utreisedato: periode.utreisedato, innreisedato: value })
                            }
                        />
                    </div>
                    {props.perioder.length > 1 && (
                        <Lenke
                            href="#"
                            className={sharedStyles.fjernFeltLink}
                            onClick={() => props.onFjernClick(index)}
                        >
                            Fjern felt
                        </Lenke>
                    )}
                </div>
            ))}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()}>Legg til felt</Knapp>
            </div>
        </div>
    );
};

const Utenlandsopphold = () => {
    const utenlandsopphold = useAppSelector(s => s.soknad.utenlandsopphold);
    const dispatch = useAppDispatch();

    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.utenlandsoppholdUpdated({
                harReistTilUtlandetSiste90dager: values.harReistTilUtlandetSiste90dager,
                harReistDatoer: values.harReistTilUtlandetSiste90dager ? values.harReistDatoer : [],
                skalReiseTilUtlandetNeste12Måneder: values.skalReiseTilUtlandetNeste12Måneder,
                skalReiseDatoer: values.skalReiseTilUtlandetNeste12Måneder ? values.skalReiseDatoer : []
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            harReistTilUtlandetSiste90dager: utenlandsopphold.harReistTilUtlandetSiste90dager,
            harReistDatoer: utenlandsopphold.harReistDatoer,
            skalReiseTilUtlandetNeste12Måneder: utenlandsopphold.skalReiseTilUtlandetNeste12Måneder,
            skalReiseDatoer: utenlandsopphold.skalReiseDatoer
        },
        onSubmit: values => {
            save(values);
        }
    });

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={sharedStyles.container}>
                <form onSubmit={formik.handleSubmit}>
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id={'harreist'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harReistSiste90.label" />}
                            feil={null}
                            state={formik.values.harReistTilUtlandetSiste90dager}
                            onChange={val => {
                                formik.setValues({ ...formik.values, harReistTilUtlandetSiste90dager: val });
                            }}
                        />

                        {formik.values.harReistTilUtlandetSiste90dager && (
                            <MultiTidsperiodevelger
                                perioder={formik.values.harReistDatoer}
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        harReistDatoer: [
                                            ...formik.values.harReistDatoer,
                                            {
                                                innreisedato: '',
                                                utreisedato: ''
                                            }
                                        ]
                                    });
                                }}
                                onFjernClick={index => {
                                    formik.setValues({
                                        ...formik.values,
                                        harReistDatoer: formik.values.harReistDatoer.filter((_, i) => index !== i)
                                    });
                                }}
                                onChange={val => {
                                    formik.setValues({
                                        ...formik.values,
                                        harReistDatoer: formik.values.harReistDatoer.map((periode, i) =>
                                            val.index === i
                                                ? {
                                                      innreisedato: val.innreisedato,
                                                      utreisedato: val.utreisedato
                                                  }
                                                : periode
                                        )
                                    });
                                }}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="skalreise"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.skalReiseNeste12.label" />}
                            feil={null}
                            state={formik.values.skalReiseTilUtlandetNeste12Måneder}
                            onChange={val => {
                                formik.setValues({ ...formik.values, skalReiseTilUtlandetNeste12Måneder: val });
                            }}
                        />

                        {formik.values.skalReiseTilUtlandetNeste12Måneder && (
                            <MultiTidsperiodevelger
                                perioder={formik.values.skalReiseDatoer}
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: [
                                            ...formik.values.skalReiseDatoer,
                                            {
                                                innreisedato: '',
                                                utreisedato: ''
                                            }
                                        ]
                                    });
                                }}
                                onFjernClick={index => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: formik.values.skalReiseDatoer.filter((_, i) => index !== i)
                                    });
                                }}
                                onChange={val => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: formik.values.skalReiseDatoer.map((periode, i) =>
                                            val.index === i
                                                ? {
                                                      innreisedato: val.innreisedato,
                                                      utreisedato: val.utreisedato
                                                  }
                                                : periode
                                        )
                                    });
                                }}
                            />
                        )}
                    </div>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                            },
                            steg: Søknadsteg.DinInntekt
                        }}
                        next={{
                            steg: Søknadsteg.Kontakt
                        }}
                    />
                </form>
            </div>
        </TextProvider>
    );
};

export default Utenlandsopphold;

import * as React from 'react';

import { Input } from 'nav-frontend-skjema';
import { FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import TextProvider, { Languages } from '~components/TextProvider';

import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '../../../../lib/types';

import messages from './inntekt-nb';

interface FormData {
    harInntekt: Nullable<boolean>;
    inntektBeløp: Nullable<string>;
    harMottattSosialstønad: Nullable<boolean>;
    mottarPensjon: Nullable<boolean>;
    pensjonsInntekt: Array<any>; // TODO
}

const DinInntekt = () => {
    const inntektFraStore = useAppSelector(s => s.soknad.inntekt);
    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {
            harInntekt: inntektFraStore.harInntekt,
            inntektBeløp: inntektFraStore.inntektBeløp,
            harMottattSosialstønad: inntektFraStore.harMottattSosialstønad,
            mottarPensjon: inntektFraStore.mottarPensjon,
            pensjonsInntekt: inntektFraStore.pensjonsInntekt
        },
        onSubmit: values => {
            save(values);
        }
    });

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.inntektUpdated({
                harInntekt: values.harInntekt,
                inntektBeløp: values.inntektBeløp,
                harMottattSosialstønad: values.harMottattSosialstønad,
                mottarPensjon: values.mottarPensjon,
                pensjonsInntekt: values.pensjonsInntekt
            })
        );

    // const pensjonsInntekter = () => {
    //     return (
    //         <div>
    //             {pensjonsInntekt.map((item: { ordning: string; beløp: string }, index: number) => (
    //                 <div className={sharedStyles.inputFelterDiv} key={index}>
    //                     <Input
    //                         className={sharedStyles.inputFelt}
    //                         label={<FormattedMessage id="input.pensjonsOrdning.label" />}
    //                         value={item.ordning}
    //                         onChange={e => updatePensjonsOrdning(e.target.value, index)}
    //                     />
    //                     <Input
    //                         className={sharedStyles.inputFelt}
    //                         label={<FormattedMessage id="input.pensjonsBeløp.label" />}
    //                         value={item.beløp}
    //                         onChange={e => updatePensjonsBeløp(e.target.value, index)}
    //                     />
    //                     {pensjonsInntekt.length > 1 && (
    //                         <Lenke
    //                             href="#"
    //                             className={sharedStyles.fjernFeltLink}
    //                             onClick={() => fjernValgtInputFelt(index)}
    //                         >
    //                             Fjern felt
    //                         </Lenke>
    //                     )}
    //                 </div>
    //             ))}
    //             <div className={sharedStyles.leggTilFeltKnapp}>
    //                 <Knapp onClick={() => addInputFelt()}>Legg til felt</Knapp>
    //             </div>
    //         </div>
    //     );
    // };

    // const updatePensjonsOrdning = (value: string, index: number) => {
    //     const pensjonsInntektItem = { ordning: value, beløp: pensjonsInntekt[index].beløp };

    //     const tempPensjonsOrdning = [
    //         ...pensjonsInntekt.slice(0, index),
    //         pensjonsInntektItem,
    //         ...pensjonsInntekt.slice(index + 1)
    //     ];
    //     setPensjonsInntekt(tempPensjonsOrdning);
    // };

    // const updatePensjonsBeløp = (value: string, index: number) => {
    //     const pensjonsInntektItem = { ordning: pensjonsInntekt[index].ordning, beløp: value };

    //     const tempPensjonsOrdning = [
    //         ...pensjonsInntekt.slice(0, index),
    //         pensjonsInntektItem,
    //         ...pensjonsInntekt.slice(index + 1)
    //     ];
    //     setPensjonsInntekt(tempPensjonsOrdning);
    // };

    // const addInputFelt = () => {
    //     const added = [...pensjonsInntekt];
    //     added.push({ ordning: '', beløp: '' });
    //     setPensjonsInntekt(added);
    // };

    // const fjernValgtInputFelt = (index: number) => {
    //     const tempField = [...pensjonsInntekt.slice(0, index), ...pensjonsInntekt.slice(index + 1)];
    //     setPensjonsInntekt(tempField);
    // };

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={sharedStyles.container}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        id="harInntekt"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harInntekt.label" />}
                        feil={null}
                        state={formik.values.harInntekt}
                        onChange={val =>
                            formik.setValues({
                                ...formik.values,
                                harInntekt: val
                            })
                        }
                    />

                    {formik.values.harInntekt && (
                        <Input
                            id="inntektBeløp"
                            className={sharedStyles.sporsmal}
                            value={formik.values.inntektBeløp || ''}
                            label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                            onChange={formik.handleChange}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="mottarPensjon"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.mottarPensjon.label" />}
                        feil={null}
                        state={formik.values.mottarPensjon}
                        onChange={val =>
                            formik.setValues({
                                ...formik.values,
                                mottarPensjon: val
                            })
                        }
                    />
                    {/* {mottarPensjon && pensjonsInntekter()} */}

                    <JaNeiSpørsmål
                        id="harMottattSosialstønad"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                        feil={null}
                        state={formik.values.harMottattSosialstønad}
                        onChange={val =>
                            formik.setValues({
                                ...formik.values,
                                harMottattSosialstønad: val
                            })
                        }
                    />
                </div>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            save(formik.values);
                        },
                        steg: Søknadsteg.DinFormue
                    }}
                    next={{
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default DinInntekt;

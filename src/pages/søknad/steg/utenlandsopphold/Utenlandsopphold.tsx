import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { guid } from 'nav-frontend-js-utils';

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

const Utenlandsopphold = () => {
    const utenlandsopphold = useAppSelector(s => s.soknad.utenlandsopphold);
    const [harReistTilUtlandetSiste90dager, setHarReistTilUtlandetSiste90dager] = React.useState(
        utenlandsopphold.harReistTilUtlandetSiste90dager
    );
    const [harReistDatoer, setHarReistDatoer] = React.useState<Array<{ utreisedato: string; innreisedato: string }>>(
        utenlandsopphold.harReistDatoer
    );

    const [skalReiseTilUtlandetNeste12Måneder, setSkalReiseTilUtlandetNeste12Måneder] = React.useState(
        utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
    );
    const [skalReiseDatoer, setSkalReiseDatoer] = React.useState<Array<{ utreisedato: string; innreisedato: string }>>(
        utenlandsopphold.skalReiseDatoer
    );
    const dispatch = useAppDispatch();

    const updateDate = (
        arrayToUpdate: Array<{ utreisedato: string; innreisedato: string }>,
        index: number,
        value: string,
        dateType: 'utreisedato' | 'innreisedato'
    ) => {
        const x = { ...arrayToUpdate[index] };
        x[dateType] = value;
        const tempArr = [...arrayToUpdate.slice(0, index), x, ...arrayToUpdate.slice(index + 1)];

        if (arrayToUpdate === harReistDatoer) {
            setHarReistDatoer(tempArr);
        } else if (arrayToUpdate === skalReiseDatoer) {
            setSkalReiseDatoer(tempArr);
        }
    };

    const addInputFelt = (arrayToAdd: Array<{ utreisedato: string; innreisedato: string }>) => {
        const tempArr = [...arrayToAdd];
        tempArr.push({ utreisedato: '', innreisedato: '' });
        if (arrayToAdd === harReistDatoer) {
            setHarReistDatoer(tempArr);
        } else if (arrayToAdd === skalReiseDatoer) {
            setSkalReiseDatoer(tempArr);
        }
    };

    const fjernValgtInputFelt = (
        arrayToRemoveFrom: Array<{ utreisedato: string; innreisedato: string }>,
        index: number
    ) => {
        const tempArr = [...arrayToRemoveFrom.slice(0, index), ...arrayToRemoveFrom.slice(index + 1)];
        if (arrayToRemoveFrom === harReistDatoer) {
            setHarReistDatoer(tempArr);
        } else if (arrayToRemoveFrom === skalReiseDatoer) {
            setSkalReiseDatoer(tempArr);
        }
    };

    const harReistInputs = () => {
        return (
            <div>
                {harReistDatoer.map((item, index) => (
                    <div className={sharedStyles.inputFelterDiv} key={guid()}>
                        <div className={sharedStyles.inputFelt}>
                            <label>Utreisedato</label>
                            <Datovelger
                                input={{
                                    name: 'utreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    id: `${index}-harReist-utreisedato`
                                }}
                                valgtDato={item.utreisedato}
                                id={`${index}-harReist-utreisedato`}
                                onChange={value => updateDate(harReistDatoer, index, value, 'utreisedato')}
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
                                valgtDato={item.innreisedato}
                                id={`${index}-harReist-innreisedato`}
                                onChange={value => updateDate(harReistDatoer, index, value, 'innreisedato')}
                            />
                        </div>
                        {harReistDatoer.length > 1 && (
                            <Lenke
                                href="#"
                                className={sharedStyles.fjernFeltLink}
                                onClick={() => fjernValgtInputFelt(harReistDatoer, index)}
                            >
                                Fjern felt
                            </Lenke>
                        )}
                    </div>
                ))}
                <div className={sharedStyles.leggTilFeltKnapp}>
                    <Knapp onClick={() => addInputFelt(harReistDatoer)}>Legg til felt</Knapp>
                </div>
            </div>
        );
    };

    const skalReiseInputs = () => {
        return (
            <div>
                {skalReiseDatoer.map((item, index) => (
                    <div className={sharedStyles.inputFelterDiv} key={guid()}>
                        <div className={sharedStyles.inputFelt}>
                            <label>Utreisedato</label>
                            <Datovelger
                                input={{
                                    name: 'utreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    id: `${index}-skalReise-utreisedato`
                                }}
                                valgtDato={item.utreisedato}
                                id={`${index}-skalReise-utreisedato`}
                                onChange={value => updateDate(skalReiseDatoer, index, value, 'utreisedato')}
                            />
                        </div>

                        <div className={sharedStyles.inputFelt}>
                            <label>Innreisedato</label>
                            <Datovelger
                                input={{
                                    name: 'innreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    id: `${index}-skalReise-innreisedato`
                                }}
                                valgtDato={item.innreisedato}
                                id={`${index}-skalReise-innreisedato`}
                                onChange={value => updateDate(skalReiseDatoer, index, value, 'innreisedato')}
                            />
                        </div>
                        {skalReiseDatoer.length > 1 && (
                            <Lenke
                                href="#"
                                className={sharedStyles.fjernFeltLink}
                                onClick={() => fjernValgtInputFelt(skalReiseDatoer, index)}
                            >
                                Fjern felt
                            </Lenke>
                        )}
                    </div>
                ))}
                <div className={sharedStyles.leggTilFeltKnapp}>
                    <Knapp onClick={() => addInputFelt(skalReiseDatoer)}>Legg til felt</Knapp>
                </div>
            </div>
        );
    };

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={sharedStyles.container}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harReistSiste90.label" />}
                        feil={null}
                        fieldName={'harreist'}
                        state={harReistTilUtlandetSiste90dager}
                        onChange={setHarReistTilUtlandetSiste90dager}
                    />

                    {harReistTilUtlandetSiste90dager && harReistInputs()}

                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.skalReiseNeste12.label" />}
                        feil={null}
                        fieldName={'skalreise'}
                        state={skalReiseTilUtlandetNeste12Måneder}
                        onChange={setSkalReiseTilUtlandetNeste12Måneder}
                    />

                    {skalReiseTilUtlandetNeste12Måneder && skalReiseInputs()}
                </div>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.utenlandsoppholdUpdated({
                                    harReistTilUtlandetSiste90dager,
                                    harReistDatoer,
                                    skalReiseTilUtlandetNeste12Måneder,
                                    skalReiseDatoer
                                })
                            );
                        },
                        steg: Søknadsteg.DinInntekt
                    }}
                    next={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.utenlandsoppholdUpdated({
                                    harReistTilUtlandetSiste90dager,
                                    harReistDatoer,
                                    skalReiseTilUtlandetNeste12Måneder,
                                    skalReiseDatoer
                                })
                            );
                        },
                        steg: Søknadsteg.Kontakt
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default Utenlandsopphold;

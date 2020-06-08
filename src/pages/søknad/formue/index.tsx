import * as React from 'react';
import { Input } from 'nav-frontend-skjema';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';

const DinFormue = () => {
    const formueFraStore = useAppSelector(s => s.soknad.formue);
    const [harFomue, setHarFormue] = React.useState(formueFraStore.harFomue);
    const [belopFormue, setBelopFormue] = React.useState(formueFraStore.belopFormue);
    const [eierBolig, setEierBolig] = React.useState(formueFraStore.eierBolig);
    const [harDepositumskonto, setHarDepositumskonto] = React.useState(formueFraStore.harDepositumskonto);

    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'har Formue?'}
                feil={null}
                fieldName={'formue'}
                state={harFomue}
                onChange={setHarFormue}
            />
            {harFomue && (
                <Input
                    value={belopFormue ?? ''}
                    label="Oppgi beløp"
                    onChange={e => {
                        setBelopFormue(e.target.value);
                    }}
                />
            )}

            <JaNeiSpørsmål
                legend={'Eier bolig?'}
                feil={null}
                fieldName={'eierbolig'}
                state={eierBolig}
                onChange={setEierBolig}
            />
            <JaNeiSpørsmål
                legend={'Har depositumskonto?'}
                feil={null}
                fieldName={'depositumskonto'}
                state={harDepositumskonto}
                onChange={setHarDepositumskonto}
            />

            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.formueUpdated({
                                harFomue,
                                belopFormue,
                                eierBolig,
                                harDepositumskonto
                            })
                        );
                    },
                    steg: Søknadsteg.BoOgOppholdINorge
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.formueUpdated({
                                harFomue,
                                belopFormue: harFomue ? belopFormue : null,
                                eierBolig,
                                harDepositumskonto
                            })
                        );
                    },
                    steg: Søknadsteg.DinInntekt
                }}
            />
        </div>
    );
};

export default DinFormue;

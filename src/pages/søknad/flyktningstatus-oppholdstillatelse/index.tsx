import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';

const FlyktningstatusOppholdstillatelse = () => {
    const flyktningstatusFraStore = useAppSelector(s => s.soknad.flyktningstatus);
    const [erFlyktning, setErFlyktning] = React.useState(flyktningstatusFraStore.erFlyktning);
    const [harOppholdstillatelse, setHarOppholdstillatelse] = React.useState(
        flyktningstatusFraStore.harOppholdstillatelse
    );
    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'Er flyktning?'}
                feil={null}
                fieldName={'flyktning'}
                state={erFlyktning}
                onChange={val => {
                    setErFlyktning(val);
                }}
            />
            <JaNeiSpørsmål
                legend={'Oppholdstillatelse?'}
                feil={null}
                fieldName={'oppholdstillatelse'}
                state={harOppholdstillatelse}
                onChange={val => {
                    setHarOppholdstillatelse(val);
                }}
            />

            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.flyktningstatusUpdated({
                                erFlyktning,
                                harOppholdstillatelse
                            })
                        );
                    },
                    steg: Søknadsteg.Uførevedtak
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.flyktningstatusUpdated({
                                erFlyktning,
                                harOppholdstillatelse
                            })
                        );
                    },
                    steg: Søknadsteg.BoOgOppholdINorge
                }}
            />
        </div>
    );
};

export default FlyktningstatusOppholdstillatelse;

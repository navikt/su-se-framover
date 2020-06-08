import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';

const Utenlandsopphold = () => {
    const utenlandsopphold = useAppSelector(s => s.soknad.utenlandsopphold);
    const [harReistTilUtlandetSiste90dager, setHarReistTilUtlandetSiste90dager] = React.useState(
        utenlandsopphold.harReistTilUtlandetSiste90dager
    );
    const [skalReiseTilUtlandetNeste12Måneder, setSkalReiseTilUtlandetNeste12Måneder] = React.useState(
        utenlandsopphold.skalReiseTilUtlandetNeste12Måneder
    );

    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'Har du reist til utlandet de siste 90 dager?'}
                feil={null}
                fieldName={'harreist'}
                state={harReistTilUtlandetSiste90dager}
                onChange={setHarReistTilUtlandetSiste90dager}
            />

            <JaNeiSpørsmål
                legend={'Har du planer om å reise til utlandet i de neste 12 månedene?'}
                feil={null}
                fieldName={'skalreise'}
                state={skalReiseTilUtlandetNeste12Måneder}
                onChange={setSkalReiseTilUtlandetNeste12Måneder}
            />

            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.utenlandsoppholdUpdated({
                                harReistTilUtlandetSiste90dager,
                                skalReiseTilUtlandetNeste12Måneder
                            })
                        );
                    },
                    steg: Søknadsteg.DinInntekt
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.utenlandsoppholdUpdated({
                                harReistTilUtlandetSiste90dager,
                                skalReiseTilUtlandetNeste12Måneder
                            })
                        );
                    },
                    steg: Søknadsteg.Kontakt
                }}
            />
        </div>
    );
};

export default Utenlandsopphold;

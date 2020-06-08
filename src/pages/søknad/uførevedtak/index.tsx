import * as React from 'react';

import Bunnknapper from '../Bunnknapper';
import { Søknadsteg } from '../types';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';

const Uførevedtak = () => {
    const harVedtakFraStore = useAppSelector(s => s.soknad.harUførevedtak);
    const [harVedtak, setHarVedtak] = React.useState<null | boolean>(harVedtakFraStore);
    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'heisann'}
                feil={null}
                fieldName={'fieldname'}
                state={harVedtak}
                onChange={val => {
                    setHarVedtak(val);
                }}
            />

            <Bunnknapper
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(søknadSlice.actions.harUførevedtakUpdated(harVedtak));
                    },
                    steg: Søknadsteg.FlyktningstatusOppholdstillatelse
                }}
            />
        </div>
    );
};

export default Uførevedtak;

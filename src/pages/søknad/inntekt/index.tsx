import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';

const DinInntekt = () => {
    const inntektFraStore = useAppSelector(s => s.soknad.inntekt);
    const [harInntekt, setHarInntekt] = React.useState(inntektFraStore.harInntekt);
    const [harMottattSosialstønad, setHarMottattSosialstønad] = React.useState(inntektFraStore.harMottattSosialstønad);
    const [mottarPensjon, setMottarPensjon] = React.useState(inntektFraStore.mottarPensjon);

    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'har inntekt?'}
                feil={null}
                fieldName={'inntekt'}
                state={harInntekt}
                onChange={setHarInntekt}
            />

            <JaNeiSpørsmål
                legend={'Har mottatt sosialstønad?'}
                feil={null}
                fieldName={'sosialstonad'}
                state={harMottattSosialstønad}
                onChange={setHarMottattSosialstønad}
            />
            <JaNeiSpørsmål
                legend={'Mottar pensjon?'}
                feil={null}
                fieldName={'pensjon'}
                state={mottarPensjon}
                onChange={setMottarPensjon}
            />

            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.inntektUpdated({
                                harInntekt,
                                harMottattSosialstønad,
                                mottarPensjon
                            })
                        );
                    },
                    steg: Søknadsteg.DinFormue
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.inntektUpdated({
                                harInntekt,
                                harMottattSosialstønad,
                                mottarPensjon
                            })
                        );
                    },
                    steg: Søknadsteg.ReiseTilUtlandet
                }}
            />
        </div>
    );
};

export default DinInntekt;

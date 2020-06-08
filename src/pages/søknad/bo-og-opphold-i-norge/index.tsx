import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Bosituasjon } from '~features/søknad/types';

const FlyktningstatusOppholdstillatelse = () => {
    const boOgOppholdFraStore = useAppSelector(s => s.soknad.boOgOpphold);

    const [borOgOppholderSegINorge, setBorOgOppholderSegINorge] = React.useState(
        boOgOppholdFraStore.borOgOppholderSegINorge
    );
    const [borPåFolkeregistrertAdresse, setBorPåFolkeregistrertAdresse] = React.useState(
        boOgOppholdFraStore.borPåFolkeregistrertAdresse
    );
    const [bosituasjon, setBosituasjon] = React.useState(boOgOppholdFraStore.bosituasjon);
    const [delerBoligMedAndreVoksne, setDelerBoligMedAndreVoksne] = React.useState(
        boOgOppholdFraStore.delerBoligMedAndreVoksne
    );

    const dispatch = useAppDispatch();

    return (
        <div>
            <JaNeiSpørsmål
                legend={'Bor og oppholder i Norge?'}
                feil={null}
                fieldName={'fieldname'}
                state={borOgOppholderSegINorge}
                onChange={val => {
                    setBorOgOppholderSegINorge(val);
                }}
            />
            <JaNeiSpørsmål
                legend={'Bor på folkereg adresse?'}
                feil={null}
                fieldName={'fieldname'}
                state={borPåFolkeregistrertAdresse}
                onChange={val => {
                    setBorPåFolkeregistrertAdresse(val);
                }}
            />
            <RadioGruppe legend={'bosituasjon'} feil={null}>
                <Radio
                    name={'bosituasjon'}
                    label={'Alene eller med barn under 18'}
                    value={Bosituasjon.BorAleneEllerMedBarnUnder18}
                    checked={bosituasjon === Bosituasjon.BorAleneEllerMedBarnUnder18}
                    onChange={() => {
                        setBosituasjon(Bosituasjon.BorAleneEllerMedBarnUnder18);
                    }}
                />
                <Radio
                    name={'bosituasjon'}
                    label={'Bor med noen over 18?'}
                    value={Bosituasjon.BorMedNoenOver18}
                    checked={bosituasjon === Bosituasjon.BorMedNoenOver18}
                    onChange={() => {
                        setBosituasjon(Bosituasjon.BorMedNoenOver18);
                    }}
                />
            </RadioGruppe>
            <JaNeiSpørsmål
                legend={'Deler bolig med andre voksne?'}
                feil={null}
                fieldName={'fieldname'}
                state={delerBoligMedAndreVoksne}
                onChange={val => {
                    setDelerBoligMedAndreVoksne(val);
                }}
            />

            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.boOgOppholdUpdated({
                                borOgOppholderSegINorge,
                                borPåFolkeregistrertAdresse,
                                bosituasjon,
                                delerBoligMedAndreVoksne
                            })
                        );
                    },
                    steg: Søknadsteg.FlyktningstatusOppholdstillatelse
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.boOgOppholdUpdated({
                                borOgOppholderSegINorge,
                                borPåFolkeregistrertAdresse,
                                bosituasjon,
                                delerBoligMedAndreVoksne
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

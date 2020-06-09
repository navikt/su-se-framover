import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Bosituasjon } from '~features/søknad/types';
import sharedStyles from '../../steg-shared.module.less';
import { FormattedMessage } from 'react-intl';
import messages from './bo-og-opphold-i-norge-nb'
import TextProvider, { Languages } from '~components/TextProvider';
const BoOgOppholdINorge = () => {
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
        <TextProvider messages={{ [Languages.nb]: messages }}>

            <div className={sharedStyles.container}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.opphold-i-norge.label" />}
                        feil={null}
                        fieldName={'opphold-i-norge'}
                        state={borOgOppholderSegINorge}
                        onChange={setBorOgOppholderSegINorge}
                    />
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.folkereg-adresse.label" />}
                        feil={null}
                        fieldName={'folkereg-adresse'}
                        state={borPåFolkeregistrertAdresse}
                        onChange={setBorPåFolkeregistrertAdresse}
                    />
                    <RadioGruppe
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id={"input.bosituasjon.label"} />}
                        feil={null}
                    >
                        <Radio
                            name={'bosituasjon'}
                            label={<FormattedMessage id={"input.bosituasjon.alene.label"} />}
                            value={Bosituasjon.BorAleneEllerMedBarnUnder18}
                            checked={bosituasjon === Bosituasjon.BorAleneEllerMedBarnUnder18}
                            onChange={() => {
                                setBosituasjon(Bosituasjon.BorAleneEllerMedBarnUnder18);
                            }}
                        />
                        <Radio
                            name={'bosituasjon'}
                            label={<FormattedMessage id={"input.bosituasjon.medNoenOver18.label"} />}
                            value={Bosituasjon.BorMedNoenOver18}
                            checked={bosituasjon === Bosituasjon.BorMedNoenOver18}
                            onChange={() => {
                                setBosituasjon(Bosituasjon.BorMedNoenOver18);
                            }}
                        />
                    </RadioGruppe>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id={"input.delerBoligMedAndreVoksne.label"} />}
                        feil={null}
                        fieldName={'delerBoligMedAndreVoksne'}
                        state={delerBoligMedAndreVoksne}
                        onChange={setDelerBoligMedAndreVoksne}
                    />
                </div>

                <Bunnknapper
                    previous={{
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
                        steg: Søknadsteg.DinFormue
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default BoOgOppholdINorge;

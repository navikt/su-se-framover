import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import TextProvider, { Languages } from '~components/TextProvider';
import messages from './flyktningstatus-oppholdstillatelse-nb';
import { FormattedMessage } from 'react-intl';
import sharedStyles from '../../steg-shared.module.less';

const FlyktningstatusOppholdstillatelse = () => {
    const flyktningstatusFraStore = useAppSelector(s => s.soknad.flyktningstatus);
    const [erFlyktning, setErFlyktning] = React.useState(flyktningstatusFraStore.erFlyktning);
    const [harOppholdstillatelse, setHarOppholdstillatelse] = React.useState(
        flyktningstatusFraStore.harOppholdstillatelse
    );
    const dispatch = useAppDispatch();

    return (
        <div className={sharedStyles.container}>
            <TextProvider messages={{ [Languages.nb]: messages }}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.flyktning.label" />}
                        feil={null}
                        fieldName={'flyktning'}
                        state={erFlyktning}
                        onChange={val => {
                            setErFlyktning(val);
                        }}
                    />
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.oppholdstillatelse.label" />}
                        feil={null}
                        fieldName={'oppholdstillatelse'}
                        state={harOppholdstillatelse}
                        onChange={val => {
                            setHarOppholdstillatelse(val);
                        }}
                    />
                </div>
                <Bunnknapper
                    previous={{
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
            </TextProvider>
        </div>
    );
};

export default FlyktningstatusOppholdstillatelse;

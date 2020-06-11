import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage } from 'react-intl';

import TextProvider, { Languages } from '~components/TextProvider';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import messages from './dinformue-nb'

const DinFormue = () => {
    const formueFraStore = useAppSelector(s => s.soknad.formue);
    const [harFormue, setHarFormue] = React.useState(formueFraStore.harFomue);
    const [belopFormue, setBelopFormue] = React.useState(formueFraStore.belopFormue);
    const [eierBolig, setEierBolig] = React.useState(formueFraStore.eierBolig);
    const [harDepositumskonto, setHarDepositumskonto] = React.useState(formueFraStore.harDepositumskonto);

    const dispatch = useAppDispatch();

    return (
        <div className={sharedStyles.container}>
            <TextProvider messages={{ [Languages.nb]: messages }} >
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harFormue.label" />}
                        feil={null}
                        fieldName={'formue'}
                        state={harFormue}
                        onChange={setHarFormue}
                    />

                    {harFormue && (
                        <Input
                            className={sharedStyles.sporsmal}
                            value={belopFormue ?? ''}
                            label={<FormattedMessage id="input.oppgiBeløp.label" />}
                            onChange={e => {
                                setBelopFormue(e.target.value);
                            }}
                        />
                    )}

                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.eierDuBolig.label" />}
                        feil={null}
                        fieldName={'eierbolig'}
                        state={eierBolig}
                        onChange={setEierBolig}
                    />
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.depositumskonto.label" />}
                        feil={null}
                        fieldName={'depositumskonto'}
                        state={harDepositumskonto}
                        onChange={setHarDepositumskonto}
                    />
                </div>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.formueUpdated({
                                    harFomue: harFormue,
                                    belopFormue,
                                    eierBolig,
                                    harDepositumskonto
                                })
                            );
                        },
                        steg: Søknadsteg.BoOgOppholdINorge
                    }}
                    next={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.formueUpdated({
                                    harFomue: harFormue,
                                    belopFormue: harFormue ? belopFormue : null,
                                    eierBolig,
                                    harDepositumskonto
                                })
                            );
                        },
                        steg: Søknadsteg.DinInntekt
                    }}
                />
            </TextProvider>
        </div>
    );
};

export default DinFormue;

import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import TextProvider, { Languages } from '~components/TextProvider';
import { FormattedMessage } from 'react-intl';
import messages from './utenlandsopphold-nb';

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
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        legend={<FormattedMessage id="input.harReistSiste90.label" />}
                        feil={null}
                        fieldName={'harreist'}
                        state={harReistTilUtlandetSiste90dager}
                        onChange={setHarReistTilUtlandetSiste90dager}
                    />

                    <JaNeiSpørsmål
                        legend={<FormattedMessage id="input.skalReiseNeste12.label" />}
                        feil={null}
                        fieldName={'skalreise'}
                        state={skalReiseTilUtlandetNeste12Måneder}
                        onChange={setSkalReiseTilUtlandetNeste12Måneder}
                    />
                </div>

                <Bunnknapper
                    previous={{
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
        </TextProvider>
    );
};

export default Utenlandsopphold;

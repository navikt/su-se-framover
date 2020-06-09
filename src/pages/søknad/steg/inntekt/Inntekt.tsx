import * as React from 'react';

import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import TextProvider, { Languages } from '~components/TextProvider';
import messages from './inntekt-nb';
import { FormattedMessage } from 'react-intl';
import { Input } from 'nav-frontend-skjema';
import sharedStyles from '../../steg-shared.module.less';

const DinInntekt = () => {
    const inntektFraStore = useAppSelector(s => s.soknad.inntekt);
    const [harInntekt, setHarInntekt] = React.useState(inntektFraStore.harInntekt);
    const [inntektBeløp, setinntektBeløp] = React.useState(inntektFraStore.inntektBeløp);
    const [harMottattSosialstønad, setHarMottattSosialstønad] = React.useState(inntektFraStore.harMottattSosialstønad);
    const [mottarPensjon, setMottarPensjon] = React.useState(inntektFraStore.mottarPensjon);
    const [pensjon, setPensjon] = React.useState(inntektFraStore.pensjon)
    const dispatch = useAppDispatch();

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={sharedStyles.container}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harInntekt.label" />}
                        feil={null}
                        fieldName={'inntekt'}
                        state={harInntekt}
                        onChange={setHarInntekt}
                    />

                    {harInntekt && (
                        <Input
                            className={sharedStyles.sporsmal}
                            value={inntektBeløp || ""}
                            label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                            onChange={e => setinntektBeløp(e.target.value)}
                        />)
                    }

                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.mottarPensjon.label" />}
                        feil={null}
                        fieldName={'pensjon'}
                        state={mottarPensjon}
                        onChange={setMottarPensjon}
                    />

                    {mottarPensjon && (
                        pensjon.map((input, index) => (
                            <div>
                                <Input value={input.ordning}
                                    label={<FormattedMessage id="input.pensjonsOrdning.label" />}
                                    onChange={e => console.log("Pensjons ordning: ", e.target.value)}
                                />
                                <Input value={input.beløp}
                                    label={<FormattedMessage id="input.pensjonsBeløp.label" />}
                                    onChange={e => console.log("Pensjons ordning: ", e.target.value)}
                                />

                            </div>
                        ))
                    )

                    }

                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                        feil={null}
                        fieldName={'sosialstonad'}
                        state={harMottattSosialstønad}
                        onChange={setHarMottattSosialstønad}
                    />
                </div>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.inntektUpdated({
                                    harInntekt,
                                    inntektBeløp,
                                    harMottattSosialstønad,
                                    pensjon,
                                    mottarPensjon
                                })
                            );
                        },
                        steg: Søknadsteg.DinFormue
                    }}
                    next={{
                        onClick: () => {
                            dispatch(
                                søknadSlice.actions.inntektUpdated({
                                    harInntekt,
                                    inntektBeløp,
                                    harMottattSosialstønad,
                                    pensjon,
                                    mottarPensjon
                                })
                            );
                        },
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default DinInntekt;

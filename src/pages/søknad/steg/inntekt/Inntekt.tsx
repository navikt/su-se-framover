import * as React from 'react';

import { guid } from 'nav-frontend-js-utils';

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
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';

const DinInntekt = () => {
    const inntektFraStore = useAppSelector(s => s.soknad.inntekt);
    const [harInntekt, setHarInntekt] = React.useState(inntektFraStore.harInntekt);
    const [inntektBeløp, setinntektBeløp] = React.useState(inntektFraStore.inntektBeløp);
    const [harMottattSosialstønad, setHarMottattSosialstønad] = React.useState(inntektFraStore.harMottattSosialstønad);
    const [mottarPensjon, setMottarPensjon] = React.useState(inntektFraStore.mottarPensjon);
    const [pensjonsInntekt, setPensjonsInntekt] = React.useState<Array<{ ordning: string; beløp: string }>>(
        inntektFraStore.pensjonsInntekt
    );
    const dispatch = useAppDispatch();

    const pensjonsInntekter = () => {
        return (
            <div>
                {pensjonsInntekt.map((item: { ordning: string; beløp: string }, index: number) => (
                    <div className={sharedStyles.inputFelterDiv} key={guid()}>
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsOrdning.label" />}
                            value={item.ordning || ''}
                            onChange={e => updatePensjonsOrdning(e.target.value, index)}
                        />
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsBeløp.label" />}
                            value={item.beløp || ''}
                            onChange={e => updatePensjonsBeløp(e.target.value, index)}
                        />
                        {pensjonsInntekt.length > 1 && (
                            <Lenke
                                href="#"
                                className={sharedStyles.fjernFeltLink}
                                onClick={() => fjernValgtInputFelt(index)}
                            >
                                Fjern felt
                            </Lenke>
                        )}
                    </div>
                ))}
                <div className={sharedStyles.leggTilFeltKnapp}>
                    <Knapp onClick={() => addInputFelt()}>Legg til felt</Knapp>
                </div>
            </div>
        );
    };

    const updatePensjonsOrdning = (value: string, index: number) => {
        const pensjonsInntektItem = pensjonsInntekt[index];
        pensjonsInntektItem.ordning = value;

        const tempPensjonsOrdning = [
            ...pensjonsInntekt.slice(0, index),
            pensjonsInntektItem,
            ...pensjonsInntekt.slice(index + 1)
        ];
        setPensjonsInntekt(tempPensjonsOrdning);
    };

    const updatePensjonsBeløp = (value: string, index: number) => {
        const pensjonsInntektItem = { ...pensjonsInntekt[index] };
        pensjonsInntektItem.beløp = value;

        const tempPensjonsOrdning = [
            ...pensjonsInntekt.slice(0, index),
            pensjonsInntektItem,
            ...pensjonsInntekt.slice(index + 1)
        ];
        setPensjonsInntekt(tempPensjonsOrdning);
    };

    const addInputFelt = () => {
        const added = [...pensjonsInntekt];
        added.push({ ordning: '', beløp: '' });
        setPensjonsInntekt(added);
    };

    const fjernValgtInputFelt = (index: number) => {
        const tempField = [...pensjonsInntekt.slice(0, index), ...pensjonsInntekt.slice(index + 1)];
        setPensjonsInntekt(tempField);
    };

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
                            value={inntektBeløp || ''}
                            label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                            onChange={e => setinntektBeløp(e.target.value)}
                        />
                    )}

                    <JaNeiSpørsmål
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.mottarPensjon.label" />}
                        feil={null}
                        fieldName={'pensjon'}
                        state={mottarPensjon}
                        onChange={setMottarPensjon}
                    />
                    {mottarPensjon && pensjonsInntekter()}

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
                                    pensjonsInntekt,
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
                                    pensjonsInntekt,
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

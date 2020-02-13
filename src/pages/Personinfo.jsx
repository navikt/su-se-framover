import { useHistory } from 'react-router-dom';
import { Panel } from 'nav-frontend-paneler';
import { useGet } from '../hooks/useGet';
import React from 'react';
import { Innholdstittel, Normaltekst } from 'nav-frontend-typografi';

function Person({ config }) {
    const history = useHistory();
    const { fornavn, etternavn } = history.location.state.data;
    return (
        <div>
            <Panel>
                <Innholdstittel>Personinfo</Innholdstittel>
                <Panel border>
                    <div>
                        <Normaltekst tag="span">Fornavn: </Normaltekst>
                        <Normaltekst tag="span">{fornavn}</Normaltekst>
                    </div>
                    <div>
                        <Normaltekst tag="span">Etternavn: </Normaltekst>
                        <Normaltekst tag="span">{etternavn}</Normaltekst>
                    </div>
                </Panel>
                <Inntekt config={config} />
            </Panel>
        </div>
    );
}

function Inntekt({ config }) {
    const history = useHistory();
    const props = history.location.state;
    const url = config
        ? config.suSeBakoverUrl + `/inntekt?ident=${props.ident}&fomDato=${props.fomDato}&tomDato=${props.tomDato}`
        : undefined;
    const { data } = useGet({ url });
    return (
        <div>
            <Innholdstittel>Inntekter</Innholdstittel>
            <Panel border>
                <InntektsTabell inntekt={data} />
            </Panel>
        </div>
    );
}

function InntektsTabell({ inntekt }) {
    if (inntekt) {
        return (
            <table className="tabell">
                <thead>
                    <tr>
                        <th>Periode</th>
                        <th>Type</th>
                        <th>Beskrivelse</th>
                        <th>Beløp</th>
                    </tr>
                </thead>
                {inntekt.maanedligInntekter.map((alleMnd, mndIndex) => {
                    var monthSum = 0;
                    return (
                        <tbody key={mndIndex}>
                            {alleMnd.inntekter.map((inntektMnd, inntektIndex) => {
                                monthSum += parseInt(inntektMnd.beloep);
                                return (
                                    <tr key={inntektIndex}>
                                        <td>{inntektIndex === 0 ? alleMnd.gjeldendeMaaned : ''}</td>
                                        <td>{inntektMnd.type}</td>
                                        <td>{inntektMnd.beskrivelse.toUpperCase()}</td>
                                        <td>{inntektMnd.beloep}</td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td />
                                <td />
                                <td>SUM</td>
                                <td>{monthSum}</td>
                            </tr>
                        </tbody>
                    );
                })}
            </table>
        );
    } else {
        return '';
    }
}

export default Person;

import classNames from 'classnames';
import { Element, Ingress, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { FormueVilkår, VurderingsperiodeFormue } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';

import messages from './formue-nb';
import styles from './formue.module.less';

interface OppsummeringsTing {
    side: 'venstre' | 'høyre';
    containerStyle: string;
}

export const Formuevurdering = (props: {
    vurdering: VurderingsperiodeFormue;
    containerStyle?: string;
    oppsummeringsTing?: OppsummeringsTing;
}) => {
    const { vurdering, containerStyle, oppsummeringsTing } = props;
    const intl = useI18n({ messages });

    return (
        <div className={containerStyle}>
            {oppsummeringsTing?.side !== 'venstre' && (
                <Element>{DateUtils.formatPeriode(vurdering.periode, intl)}</Element>
            )}
            {/*finn på noe bedre her også */}
            {oppsummeringsTing?.side === 'venstre' && <Element>&nbsp;</Element>}
            <div className={oppsummeringsTing ? oppsummeringsTing.containerStyle : styles.oppsummeringsContainer}>
                <div className={styles.formueInfo}>
                    {/*Finnes en bedre måte? Denne er for å få teksten alignet med verdiene */}
                    <Normaltekst>&nbsp;</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.innskudd' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.stårNoenIGjeldTilDeg' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.kontanter' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.depositum' })}</Normaltekst>
                </div>
                <div className={styles.søkerOgEPSContainer}>
                    <div>
                        <Normaltekst className={styles.formueVerdiTittel}>
                            {intl.formatMessage({ id: 'gjeldendeformue.søker' })}
                        </Normaltekst>
                        <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                            <Element>{vurdering.grunnlag?.søkersFormue.verdiIkkePrimærbolig}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.verdiEiendommer}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.verdiKjøretøy}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.innskudd}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.verdipapir}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.pengerSkyldt}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.kontanter}</Element>
                            <Element>{vurdering.grunnlag?.søkersFormue.depositumskonto}</Element>
                        </div>
                    </div>
                    {vurdering.grunnlag?.epsFormue && (
                        <div>
                            <Normaltekst className={styles.formueVerdiTittel}>
                                {intl.formatMessage({ id: 'gjeldendeformue.eps' })}
                            </Normaltekst>
                            <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                                <Element>{vurdering.grunnlag?.epsFormue.verdiIkkePrimærbolig}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.verdiEiendommer}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.verdiKjøretøy}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.innskudd}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.verdipapir}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.pengerSkyldt}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.kontanter}</Element>
                                <Element>{vurdering.grunnlag?.epsFormue.depositumskonto}</Element>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GjeldendeFormue = (props: { gjeldendeFormue: FormueVilkår; oppsummeringsTing?: OppsummeringsTing }) => {
    const intl = useI18n({ messages });

    return (
        <div>
            {!props.oppsummeringsTing && (
                <div className={styles.eksisterendeVedtakTittelContainer}>
                    <Ingress>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.tittel' })}</Ingress>
                </div>
            )}
            <ul>
                {props.gjeldendeFormue.vurderinger.map((vurdering) => (
                    <li key={vurdering.id}>
                        <Formuevurdering vurdering={vurdering} oppsummeringsTing={props.oppsummeringsTing} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeFormue;

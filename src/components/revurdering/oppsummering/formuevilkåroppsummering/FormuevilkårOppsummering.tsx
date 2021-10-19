import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { FormueVilkår, VurderingsperiodeFormue } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './formuevilkåroppsummering-nb';
import styles from './formuevilkåroppsummering.module.less';

const FormuevilkårOppsummering = (props: { gjeldendeFormue: FormueVilkår }) => {
    return (
        <ul>
            {props.gjeldendeFormue.vurderinger.map((vurdering) => (
                <li key={vurdering.id}>
                    <Formuevurdering vurdering={vurdering} />
                </li>
            ))}
        </ul>
    );
};

export const Formuevurdering = ({ vurdering }: { vurdering: VurderingsperiodeFormue }) => {
    const { intl } = useI18n({ messages });

    return (
        <div>
            <div className={styles.gjeldendePeriode}>
                <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.gjeldendePeriode' })}</BodyShort>
                <Label>{DateUtils.formatPeriode(vurdering.periode)}</Label>
            </div>
            <div className={styles.oppsummeringsContainer}>
                <div className={styles.formueInfo}>
                    {/*Finnes en bedre måte? Denne er for å få teksten alignet med verdiene */}
                    <BodyShort>&nbsp;</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.innskudd' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.stårNoenIGjeldTilDeg' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.kontanter' })}</BodyShort>
                    <BodyShort>{intl.formatMessage({ id: 'gjeldendeformue.depositum' })}</BodyShort>
                </div>
                <div className={styles.søkerOgEPSContainer}>
                    <div>
                        <BodyShort className={styles.formueVerdiTittel}>
                            {intl.formatMessage({ id: 'gjeldendeformue.søker' })}
                        </BodyShort>
                        <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                            <Label>{vurdering.grunnlag.søkersFormue.verdiIkkePrimærbolig}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.verdiEiendommer}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.verdiKjøretøy}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.innskudd}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.verdipapir}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.pengerSkyldt}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.kontanter}</Label>
                            <Label>{vurdering.grunnlag.søkersFormue.depositumskonto}</Label>
                        </div>
                    </div>
                    {vurdering.grunnlag.epsFormue && (
                        <div>
                            <BodyShort className={styles.formueVerdiTittel}>
                                {intl.formatMessage({ id: 'gjeldendeformue.eps' })}
                            </BodyShort>
                            <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                                <Label>{vurdering.grunnlag.epsFormue.verdiIkkePrimærbolig}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.verdiEiendommer}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.verdiKjøretøy}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.innskudd}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.verdipapir}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.pengerSkyldt}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.kontanter}</Label>
                                <Label>{vurdering.grunnlag.epsFormue.depositumskonto}</Label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormuevilkårOppsummering;

import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { useI18n } from '~lib/i18n';
import { FormueVilkår, VurderingsperiodeFormue } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import * as DateUtils from '~utils/date/dateUtils';

import messages from './formuevilkåroppsummering-nb';
import styles from './formuevilkåroppsummering.module.less';

const FormuevilkårOppsummering = (props: { gjeldendeFormue: FormueVilkår }) => (
    <ul>
        {props.gjeldendeFormue.vurderinger.map((vurdering) => (
            <li key={vurdering.id}>
                <Formuevurdering vurdering={vurdering} />
            </li>
        ))}
    </ul>
);

export const Formuevurdering = ({ vurdering }: { vurdering: VurderingsperiodeFormue }) => {
    const { intl } = useI18n({ messages });

    return (
        <div className={styles.oppsummeringsContainer}>
            <OppsummeringPar
                className={styles.gjeldendePeriode}
                label={intl.formatMessage({ id: 'gjeldendeformue.gjeldendePeriode' })}
                verdi={DateUtils.formatPeriode(vurdering.periode)}
            />
            <BodyShort className={styles.formueVerdiTittel}>
                {intl.formatMessage({ id: 'gjeldendeformue.søker' })}
            </BodyShort>
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}
                verdi={vurdering.grunnlag.søkersFormue.verdiIkkePrimærbolig}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}
                verdi={vurdering.grunnlag.søkersFormue.verdiEiendommer}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}
                verdi={vurdering.grunnlag.søkersFormue.verdiKjøretøy}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.innskudd' })}
                verdi={vurdering.grunnlag.søkersFormue.innskudd}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}
                verdi={vurdering.grunnlag.søkersFormue.verdipapir}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.stårNoenIGjeldTilDeg' })}
                verdi={vurdering.grunnlag.søkersFormue.pengerSkyldt}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.kontanter' })}
                verdi={vurdering.grunnlag.søkersFormue.kontanter}
            />
            <OppsummeringPar
                label={intl.formatMessage({ id: 'gjeldendeformue.depositum' })}
                verdi={vurdering.grunnlag.søkersFormue.depositumskonto}
            />
            {vurdering.grunnlag.epsFormue && (
                <div className={styles.epsContainer}>
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
    );
};

export default FormuevilkårOppsummering;

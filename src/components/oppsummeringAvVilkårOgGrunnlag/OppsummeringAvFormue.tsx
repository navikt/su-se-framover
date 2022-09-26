import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Formuegrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import { FormueStatus, FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';
import Formuestatus from '../revurdering/formuestatus/Formuestatus';
import { regnUtFormuegrunnlagVerdier } from '../vilkårOgGrunnlagForms/formue/FormueFormUtils';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvFormueVilkår = (props: { formue: FormueVilkår; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <ul>
                {props.formue.vurderinger.length === 0 ? (
                    <OppsummeringPar
                        className={classNames(styles.oppsummeringAvResultat)}
                        label={formatMessage('vilkår.resultat')}
                        verdi={formatMessage('vilkår.ikkeVurdert')}
                    />
                ) : (
                    props.formue.vurderinger.map((f) => {
                        const søkersFormue = regnUtFormuegrunnlagVerdier(f.grunnlag.søkersFormue);
                        const epsFormue = regnUtFormuegrunnlagVerdier(f.grunnlag.epsFormue);
                        const bekreftetFormue = søkersFormue + epsFormue;
                        return (
                            <li key={f.id} className={styles.grunnlagsListe}>
                                <OppsummeringPar label={formatMessage('periode')} verdi={formatPeriode(f.periode)} />
                                <OppsummeringAvFormuegrunnlag g={f.grunnlag} />
                                <Formuestatus
                                    bekreftetFormue={bekreftetFormue}
                                    erVilkårOppfylt={f.resultat === FormueStatus.VilkårOppfylt}
                                    skalVisesSomOppsummering={props.visesIVedtak}
                                />
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

const OppsummeringAvFormuegrunnlag = (props: { g: Formuegrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.formueGrunnlagContainer}>
            <FormueTrippel label="" søkersVerdi="Søker" epsverdi={props.g.epsFormue ? 'Ektefelle/Samboer' : null} />
            <FormueTrippel
                label={formatMessage('formue.verdi.bolig')}
                søkersVerdi={props.g.søkersFormue.verdiIkkePrimærbolig}
                epsverdi={props.g.epsFormue?.verdiIkkePrimærbolig}
            />
            <FormueTrippel
                label={formatMessage('formue.verdi.eiendom')}
                søkersVerdi={props.g.søkersFormue.verdiEiendommer}
                epsverdi={props.g.epsFormue?.verdiEiendommer}
            />
            <FormueTrippel
                label={formatMessage('formue.verdi.kjøretøy')}
                søkersVerdi={props.g.søkersFormue.verdiKjøretøy}
                epsverdi={props.g.epsFormue?.verdiKjøretøy}
            />
            <FormueTrippel
                label={formatMessage('formue.innskuddsbeløp')}
                søkersVerdi={props.g.søkersFormue.innskudd}
                epsverdi={props.g.epsFormue?.innskudd}
            />
            <FormueTrippel
                label={formatMessage('formue.verdipapir')}
                søkersVerdi={props.g.søkersFormue.verdipapir}
                epsverdi={props.g.epsFormue?.verdipapir}
            />
            <FormueTrippel
                label={formatMessage('formue.noenIGjeld')}
                søkersVerdi={props.g.søkersFormue.pengerSkyldt}
                epsverdi={props.g.epsFormue?.pengerSkyldt}
            />
            <FormueTrippel
                label={formatMessage('formue.kontanterOver1000')}
                søkersVerdi={props.g.søkersFormue.kontanter}
                epsverdi={props.g.epsFormue?.kontanter}
            />
            <FormueTrippel
                label={formatMessage('formue.depositumskonto')}
                søkersVerdi={props.g.søkersFormue.depositumskonto}
                epsverdi={props.g.epsFormue?.depositumskonto}
            />
        </div>
    );
};

export const FormueTrippel = (props: {
    label: string;
    søkersVerdi: number | string | JSX.Element;
    epsverdi?: Nullable<number | string | JSX.Element>;
}) => {
    return (
        <div className={styles.formueTripple}>
            <BodyShort>{props.label}</BodyShort>
            <div
                className={classNames({
                    [styles.verdiPairMedEPS]: props.epsverdi !== null && props.epsverdi !== undefined,
                })}
            >
                <Label>{props.søkersVerdi}</Label>
                <div className={styles.verdi}>
                    <Label>{props.epsverdi}</Label>
                </div>
            </div>
        </div>
    );
};

export default OppsummeringAvFormueVilkår;

import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';

import { regnUtFormuegrunnlagVerdier } from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import Formuestatus from '~src/components/formuestatus/Formuestatus';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';
import { Formuegrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import { FormueStatus, FormueVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import SeSkattegrunnlag from '../oppsummeringAvSkattegrunnlag/Skattegrunnlagsmodal';
import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvFormueVilkår = (props: {
    eksternGrunnlagSkatt?: Nullable<EksternGrunnlagSkatt>;
    formue: FormueVilkår;
    visesIVedtak?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
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
                                <OppsummeringPar
                                    className={styles.periode}
                                    label={formatMessage('periode')}
                                    verdi={formatPeriode(f.periode)}
                                />
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
            {props.eksternGrunnlagSkatt && <SeSkattegrunnlag eksternGrunnlagSkatt={props.eksternGrunnlagSkatt} />}
        </div>
    );
};

const OppsummeringAvFormuegrunnlag = (props: { g: Formuegrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.formueGrunnlagContainer}>
            <FormueTrippel label="" søkersVerdi="Søker" epsverdi={props.g.epsFormue ? 'EPS' : null} />
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

/*
export const FormueTrippel = (props: {
    label: string;
    søkersVerdi: number | string | React.ReactElement;
    epsverdi?: Nullable<number | string | React.ReactElement>;
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
*/

export const FormueTrippel = (props: {
    label: string;
    søkersVerdi: number | string | React.ReactElement;
    epsverdi?: Nullable<number | string | React.ReactElement>;
}) => {
    return (
        <div className={styles.formueTripple}>
            <BodyShort>{props.label}</BodyShort>
            <Label>{props.søkersVerdi}</Label>
            <Label>{props.epsverdi}</Label>
        </div>
    );
};

export default OppsummeringAvFormueVilkår;

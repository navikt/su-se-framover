import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import Formuestatus from '~components/revurdering/formuestatus/Formuestatus';
import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { Utenlandsoppsummering } from '~components/revurdering/oppsummering/utenlandsopphold/Utenlandsoppsummering';
import { useI18n } from '~lib/i18n';
import { FormueResultat, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsopphold } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vurderingstatus, InformasjonSomRevurderes, InformasjonsRevurdering } from '~types/Revurdering';
import { regnUtFormuegrunnlag } from '~utils/revurdering/formue/RevurderFormueUtils';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import FormuevilkårOppsummering, { Formuevurdering } from '../formuevilkåroppsummering/FormuevilkårOppsummering';
import Fradragoppsummering from '../fradragoppsummering/Fradragoppsummering';

import { getBosituasjongrunnlagsblokker, getUførevilkårgrunnlagsblokker, Grunnlagsblokk } from './grunnlagsblokker';
import messages from './vedtaksinformasjon-nb';
import styles from './vedtaksinformasjon.module.less';

const Rad = (props: {
    overskrift?: boolean;
    radTittel?: string;
    children: { venstre: React.ReactNode; høyre: React.ReactNode };
}) => (
    <div className={classNames(styles.rad, { [styles.overskriftsrad]: props.overskrift })}>
        {props.radTittel && (
            <div className={styles.radTittelContainer}>
                <Heading level="4" size="small">
                    {props.radTittel}
                </Heading>
            </div>
        )}
        <div className={styles.childrenContainer}>
            <div className={styles.cellecontainer}>
                <div className={styles.celle}>{props.children.venstre}</div>
            </div>
            <div className={styles.cellecontainer}>
                <div className={styles.celle}>{props.children.høyre}</div>
            </div>
        </div>
    </div>
);

const Vilkårvisning = (props: { grunnlagsblokker: Grunnlagsblokk[] }) => (
    <div className={styles.vilkårvisningContainer}>
        {props.grunnlagsblokker.map((grunnlagsblokk, idx) => (
            <div key={idx} className={styles.grunnlagsblokk}>
                {grunnlagsblokk.map(({ label, verdi }) => (
                    <OppsummeringPar key={label} className={styles.info} label={label} verdi={verdi} />
                ))}
            </div>
        ))}
    </div>
);

const Uførevilkårblokk = ({ nyeData, gamleData }: { nyeData: UføreVilkår | null; gamleData: UføreVilkår | null }) => {
    const i18n = useI18n({ messages });

    if (!nyeData) {
        return null;
    }

    return (
        <Rad radTittel={i18n.formatMessage('radTittel.uførhet')}>
            {{
                venstre: <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(nyeData, i18n)} />,
                høyre: gamleData ? (
                    <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(gamleData, i18n)} />
                ) : null,
            }}
        </Rad>
    );
};

const Bosituasjonblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const i18n = useI18n({ messages });

    const nyeBosituasjongrunnlag = hentBosituasjongrunnlag(props.nyeData);
    if (!nyeBosituasjongrunnlag) return null;

    const gamleBosituasjongrunnlag = hentBosituasjongrunnlag(props.gamleData);

    return (
        <Rad radTittel={i18n.formatMessage('radTittel.bosituasjon')}>
            {{
                venstre: (
                    <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(nyeBosituasjongrunnlag, i18n)} />
                ),
                høyre: gamleBosituasjongrunnlag ? (
                    <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(gamleBosituasjongrunnlag, i18n)} />
                ) : null,
            }}
        </Rad>
    );
};

const FormuevilkårVisning = (props: { formuevilkår: FormueVilkår; begrunnelseLabel: string }) => (
    <ul>
        {props.formuevilkår.vurderinger.map((vurdering) => {
            const søkersFormue = regnUtFormuegrunnlag(vurdering.grunnlag.søkersFormue);
            const epsFormue = regnUtFormuegrunnlag(vurdering.grunnlag.epsFormue);
            const bekreftetFormue = søkersFormue + epsFormue;

            return (
                <li key={vurdering.id}>
                    <Formuevurdering vurdering={vurdering} />
                    <Formuestatus
                        bekreftetFormue={bekreftetFormue}
                        erVilkårOppfylt={vurdering.resultat === FormueResultat.VilkårOppfylt}
                    />
                    <OppsummeringPar label={props.begrunnelseLabel} verdi={vurdering.grunnlag.begrunnelse} />
                </li>
            );
        })}
    </ul>
);

const Formueblokk = (props: { nyeData: FormueVilkår; gamleData: FormueVilkår }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Rad radTittel={formatMessage('radTittel.formue')}>
            {{
                venstre: (
                    <FormuevilkårVisning
                        formuevilkår={props.nyeData}
                        begrunnelseLabel={formatMessage('formue.begrunnelse')}
                    />
                ),
                høyre: <FormuevilkårOppsummering gjeldendeFormue={props.gamleData} />,
            }}
        </Rad>
    );
};

const Fradragblokk = (props: {
    nyeData: GrunnlagsdataOgVilkårsvurderinger;
    gamleData: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Rad radTittel={formatMessage('radTittel.fradrag')}>
            {{
                venstre: <Fradragoppsummering fradrag={props.nyeData.fradrag} />,
                høyre:
                    props.gamleData.fradrag.length > 0 ? (
                        <Fradragoppsummering fradrag={props.gamleData.fradrag} />
                    ) : null,
            }}
        </Rad>
    );
};

const Utenlandsblokk = (props: { nyeData: Utenlandsopphold; gamleData: Utenlandsopphold }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Rad radTittel={formatMessage('radTittel.utenlandsopphold')}>
            {{
                venstre: <Utenlandsoppsummering oppholdIUtlandet={props.nyeData} />,
                høyre: <Utenlandsoppsummering oppholdIUtlandet={props.gamleData} />,
            }}
        </Rad>
    );
};

const Vedtaksinformasjon = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });

    const skalViseEndringerIOppsummering = Object.entries(props.revurdering.informasjonSomRevurderes)
        .filter(([informasjon]) => informasjon !== InformasjonSomRevurderes.Inntekt)
        .some(([, status]) => status === Vurderingstatus.Vurdert);

    return (
        <div className={styles.container}>
            {skalViseEndringerIOppsummering && (
                <Rad overskrift>
                    {{
                        venstre: (
                            <Heading level="3" size="medium">
                                {formatMessage('heading.nyInfo')}
                            </Heading>
                        ),
                        høyre: (
                            <Heading level="3" size="medium">
                                {formatMessage('heading.eksisterende')}
                            </Heading>
                        ),
                    }}
                </Rad>
            )}
            {props.revurdering.informasjonSomRevurderes.Uførhet === Vurderingstatus.Vurdert && (
                <Uførevilkårblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger.uføre}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Bosituasjon === Vurderingstatus.Vurdert && (
                <Bosituasjonblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Formue === Vurderingstatus.Vurdert && (
                <Formueblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger.formue}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Inntekt === Vurderingstatus.Vurdert && (
                <Fradragblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.UtenlandsoppholdOver90Dager === Vurderingstatus.Vurdert && (
                <Utenlandsblokk
                    nyeData={props.revurdering.grunnlagsdataOgVilkårsvurderinger.oppholdIUtlandet}
                    gamleData={props.grunnlagsdataOgVilkårsvurderinger.oppholdIUtlandet}
                />
            )}
        </div>
    );
};

export default Vedtaksinformasjon;

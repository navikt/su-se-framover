import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { Normaltekst, Element, Ingress } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { FormueResultat, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Revurdering, Vurderingstatus, InformasjonSomRevurderes } from '~types/Revurdering';

import Formuestatus from '../../formuestatus/Formuestatus';
import { regnUtFormuegrunnlag } from '../../RevurderFormueUtils';
import { hentBosituasjongrunnlag } from '../../revurderingUtils';
import FormuevilkårOppsummering, { Formuevurdering } from '../formuevilkåroppsummering/FormuevilkårOppsummering';

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
                <Element>{props.radTittel}</Element>
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
                {grunnlagsblokk.map((grunnlagsinfo) => (
                    <div key={grunnlagsinfo.label} className={styles.info}>
                        <Normaltekst className={styles.infolabel}>{grunnlagsinfo.label}</Normaltekst>
                        <Element className={styles.infoverdi}>{grunnlagsinfo.verdi}</Element>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const Uførevilkårblokk = (props: {
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const intl = useI18n({ messages });
    return pipe(
        O.fromNullable(props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre),
        O.fold(
            () => null,
            (uførevilkår) => (
                <Rad radTittel={intl.formatMessage({ id: 'radTittel.uførhet' })}>
                    {{
                        venstre: <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(uførevilkår, intl)} />,
                        høyre: pipe(
                            O.fromNullable(props.grunnlagsdataOgVilkårsvurderinger.uføre),
                            O.fold(
                                () => null,
                                (grunnlag) => (
                                    <Vilkårvisning grunnlagsblokker={getUførevilkårgrunnlagsblokker(grunnlag, intl)} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const Bosituasjonblokk = (props: {
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const intl = useI18n({ messages });

    return pipe(
        O.fromNullable(hentBosituasjongrunnlag(props.revurdering.grunnlagsdataOgVilkårsvurderinger)),
        O.fold(
            () => null,
            (bosituasjongrunnlag) => (
                <Rad radTittel={intl.formatMessage({ id: 'radTittel.bosituasjon' })}>
                    {{
                        venstre: (
                            <Vilkårvisning
                                grunnlagsblokker={getBosituasjongrunnlagsblokker(bosituasjongrunnlag, intl)}
                            />
                        ),
                        høyre: pipe(
                            O.fromNullable(hentBosituasjongrunnlag(props.grunnlagsdataOgVilkårsvurderinger)),
                            O.fold(
                                () => null,
                                (grunnlag) => (
                                    <Vilkårvisning grunnlagsblokker={getBosituasjongrunnlagsblokker(grunnlag, intl)} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const FormuevilkårVisning = (props: { formuevilkår: FormueVilkår; intl: IntlShape }) => {
    return (
        <ul>
            {props.formuevilkår.vurderinger.map((vurdering) => {
                const søkersFormue = regnUtFormuegrunnlag(vurdering.grunnlag?.søkersFormue);
                const epsFormue = regnUtFormuegrunnlag(vurdering.grunnlag?.epsFormue);
                const bekreftetFormue = søkersFormue + epsFormue;

                return (
                    <li key={vurdering.id}>
                        <Formuevurdering vurdering={vurdering} />
                        <Formuestatus
                            bekreftetFormue={bekreftetFormue}
                            erVilkårOppfylt={vurdering.resultat === FormueResultat.VilkårOppfylt}
                        />
                        <div className={styles.begrunnelseContainer}>
                            <Normaltekst>{props.intl.formatMessage({ id: 'formue.begrunnelse' })}</Normaltekst>
                            <Element>{vurdering.grunnlag?.begrunnelse}</Element>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

const Formueblokk = (props: {
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const intl = useI18n({ messages });

    return pipe(
        O.fromNullable(props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue),
        O.fold(
            () => null,
            (formuevilkår) => (
                <Rad radTittel={intl.formatMessage({ id: 'radTittel.formue' })}>
                    {{
                        venstre: <FormuevilkårVisning formuevilkår={formuevilkår} intl={intl} />,
                        høyre: pipe(
                            O.fromNullable(props.grunnlagsdataOgVilkårsvurderinger.formue),
                            O.fold(
                                () => null,
                                (gjeldendeFormuevilkår) => (
                                    <FormuevilkårOppsummering gjeldendeFormue={gjeldendeFormuevilkår} />
                                )
                            )
                        ),
                    }}
                </Rad>
            )
        )
    );
};

const Vedtaksinformasjon = (props: {
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const intl = useI18n({ messages });

    const skalViseEndringerIOppsummering = Object.entries(props.revurdering.informasjonSomRevurderes)
        .filter(([informasjon]) => informasjon !== InformasjonSomRevurderes.Inntekt)
        .some(([, status]) => status === Vurderingstatus.Vurdert);

    return (
        <div className={styles.container}>
            {skalViseEndringerIOppsummering && (
                <Rad overskrift>
                    {{
                        venstre: <Ingress>{intl.formatMessage({ id: 'heading.nyInfo' })}</Ingress>,
                        høyre: <Ingress>{intl.formatMessage({ id: 'heading.eksisterende' })}</Ingress>,
                    }}
                </Rad>
            )}
            {props.revurdering.informasjonSomRevurderes.Uførhet === Vurderingstatus.Vurdert && (
                <Uførevilkårblokk
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Bosituasjon === Vurderingstatus.Vurdert && (
                <Bosituasjonblokk
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
            {props.revurdering.informasjonSomRevurderes.Formue === Vurderingstatus.Vurdert && (
                <Formueblokk
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                />
            )}
        </div>
    );
};

export default Vedtaksinformasjon;

import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { Normaltekst, Element, Ingress } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Revurdering } from '~types/Revurdering';

import { Formuestatus } from '../../formue/Formue';
import FormuevilkårOppsummering, { Formuevurdering } from '../../formue/GjeldendeFormue';
import { regnUtFormuegrunnlag } from '../../formue/RevurderFormueUtils';
import { hentBosituasjongrunnlag } from '../../revurderingUtils';

import { getBosituasjongrunnlagsblokker, getUførevilkårgrunnlagsblokker, Grunnlagsblokk } from './grunnlagsblokker';
import messages from './vedtaksinformasjon-nb';
import styles from './vedtaksinformasjon.module.less';

const Rad = (props: { overskrift?: boolean; children: { venstre: React.ReactNode; høyre: React.ReactNode } }) => (
    <div className={classNames(styles.rad, { [styles.overskriftsrad]: props.overskrift })}>
        <div className={styles.cellecontainer}>
            <div className={styles.celle}>{props.children.venstre}</div>
        </div>
        <div className={styles.cellecontainer}>
            <div className={styles.celle}>{props.children.høyre}</div>
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
                <Rad>
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
                <Rad>
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
                        <Formuevurdering
                            vurdering={vurdering}
                            oppsummeringsTing={{ side: 'venstre', containerStyle: styles.formueContainer }}
                        />
                        <Formuestatus
                            bekreftetFormue={bekreftetFormue}
                            erVilkårOppfylt={vurdering.resultat === UføreResultat.VilkårOppfylt}
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
                <Rad>
                    {{
                        venstre: <FormuevilkårVisning formuevilkår={formuevilkår} intl={intl} />,
                        høyre: pipe(
                            O.fromNullable(props.grunnlagsdataOgVilkårsvurderinger.formue),
                            O.fold(
                                () => null,
                                (formuevilkår) => (
                                    <FormuevilkårOppsummering
                                        gjeldendeFormue={formuevilkår}
                                        oppsummeringsTing={{ side: 'høyre', containerStyle: styles.formueContainer }}
                                    />
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

    return (
        <div className={styles.container}>
            <Rad overskrift>
                {{
                    venstre: <Ingress>{intl.formatMessage({ id: 'heading.nyInfo' })}</Ingress>,
                    høyre: <Ingress>{intl.formatMessage({ id: 'heading.eksisterende' })}</Ingress>,
                }}
            </Rad>
            <Uførevilkårblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
            />
            <Bosituasjonblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
            />
            <Formueblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
            />
        </div>
    );
};

export default Vedtaksinformasjon;

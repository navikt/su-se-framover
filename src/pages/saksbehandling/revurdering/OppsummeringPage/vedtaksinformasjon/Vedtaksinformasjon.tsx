import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { Normaltekst, Element, Ingress } from 'nav-frontend-typografi';
import * as React from 'react';

import { useI18n } from '~lib/hooks';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

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
        </div>
    );
};

export default Vedtaksinformasjon;

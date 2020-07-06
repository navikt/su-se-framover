import React from 'react';
import { useFormik } from 'formik';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel, EtikettLiten } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';
import { guid } from 'nav-frontend-js-utils';
import { Textarea } from 'nav-frontend-skjema';

import { JaNeiSpørsmål } from '~components/FormElements';
import { Nullable } from '~lib/types';

import styles from './vilkårsvurdering.module.less';
import { VilkårVurderingStatus, Vilkårsvurdering } from '~api/behandlingApi';
import Ikon from 'nav-frontend-ikoner-assets';

interface FormData {
    vurdering: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const vilkårVurderingStatusTilJaNeiSpørsmål = (status: VilkårVurderingStatus): Nullable<boolean> => {
    switch (status) {
        case VilkårVurderingStatus.Ok:
            return true;
        case VilkårVurderingStatus.IkkeOk:
            return false;
        case VilkårVurderingStatus.IkkeVurdert:
            return null;
    }
};

const boolTilVilkårvurderingStatus = (val: Nullable<boolean>): VilkårVurderingStatus => {
    if (val === null) {
        return VilkårVurderingStatus.IkkeVurdert;
    }
    return val ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk;
};

const statusIcon = (status: VilkårVurderingStatus) => {
    switch (status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return <Ikon kind="advarsel-sirkel-fyll" />;
        case VilkårVurderingStatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" />;
        case VilkårVurderingStatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" />;
    }
};

const Vilkårsvurdering: React.FC<{
    title: string | React.ReactNode;
    paragraph: string;
    vilkårsvurdering: Vilkårsvurdering;
    legend: string | React.ReactNode;
    children?: React.ReactChild;
    className?: string;
    onSaveClick: (svar: { status: VilkårVurderingStatus; begrunnelse: Nullable<string> }) => void;
}> = (props) => {
    const formik = useFormik<FormData>({
        initialValues: {
            vurdering: vilkårVurderingStatusTilJaNeiSpørsmål(props.vilkårsvurdering.status),
            begrunnelse: props.vilkårsvurdering.begrunnelse,
        },
        onSubmit: (values) => {
            props.onSaveClick({
                status: boolTilVilkårvurderingStatus(values.vurdering),
                begrunnelse: values.begrunnelse,
            });
        },
    });

    return (
        <Ekspanderbartpanel
            className={props.className}
            tittel={
                <div className={styles.tittelContainer}>
                    <span className={styles.tittelikon}>{statusIcon(props.vilkårsvurdering.status)}</span>
                    <div className={styles.titteltekster}>
                        <Undertittel className={styles.tittel}>{props.title}</Undertittel>
                        <EtikettLiten className={styles.paragraf}>{props.paragraph}</EtikettLiten>
                    </div>
                </div>
            }
        >
            <div className={styles.container}>
                <form onSubmit={formik.handleSubmit} className={styles.form}>
                    <JaNeiSpørsmål
                        id={guid()}
                        legend={props.legend}
                        feil={null}
                        state={formik.values.vurdering}
                        onChange={(val) => formik.setValues({ ...formik.values, vurdering: val })}
                        className={styles.vurdering}
                    />
                    <div className={styles.begrunnelse}>
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            value={formik.values.begrunnelse ?? ''}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <Hovedknapp>Lagre</Hovedknapp>
                </form>
                <div className={styles.grunnlag}>{props.children}</div>
            </div>
        </Ekspanderbartpanel>
    );
};

export default Vilkårsvurdering;

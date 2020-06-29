import React from 'react';
import { useFormik } from 'formik';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel } from 'nav-frontend-typografi';
import { Hovedknapp } from 'nav-frontend-knapper';
import { guid } from 'nav-frontend-js-utils';
import { Textarea } from 'nav-frontend-skjema';

import { JaNeiSpørsmål } from '~components/FormElements';
import * as behandlingApi from '~api/behandlingApi';
import { Nullable } from '~lib/types';

import styles from './vilkårsvurdering.module.less';
interface FormData {
    vurdering: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const vilkårVurderingStatusTilJaNeiSpørsmål = (status: behandlingApi.VilkårVurderingStatus): Nullable<boolean> => {
    switch (status) {
        case behandlingApi.VilkårVurderingStatus.Ok:
            return true;
        case behandlingApi.VilkårVurderingStatus.IkkeOk:
            return false;
        case behandlingApi.VilkårVurderingStatus.IkkeVurdert:
            return null;
    }
};

const Vilkårsvurdering = (props: {
    title: string | React.ReactNode;
    icon: JSX.Element;
    legend: string | React.ReactNode;
    children?: React.ReactChild;
    status: behandlingApi.VilkårVurderingStatus;
    begrunnelse: Nullable<string>;
    onSaveClick: (svar: { status: behandlingApi.VilkårVurderingStatus; begrunnelse: Nullable<string> }) => void;
}) => {
    const formik = useFormik<FormData>({
        initialValues: {
            vurdering: vilkårVurderingStatusTilJaNeiSpørsmål(props.status),
            begrunnelse: props.begrunnelse,
        },
        onSubmit: (values) => {
            console.log(values); // TODO send inn vurdering
        },
    });

    return (
        <Ekspanderbartpanel
            tittel={
                <div className={styles.tittel}>
                    {props.icon}
                    <Undertittel>{props.title}</Undertittel>
                </div>
            }
        >
            <form onSubmit={formik.handleSubmit}>
                <JaNeiSpørsmål
                    id={guid()}
                    legend={props.legend}
                    feil={null}
                    state={formik.values.vurdering}
                    onChange={(val) => formik.setValues({ ...formik.values, vurdering: val })}
                />
                <Textarea
                    label="Begrunnelse"
                    name="begrunnelse"
                    value={formik.values.begrunnelse ?? ''}
                    onChange={formik.handleChange}
                />
                {props.children}
                <Hovedknapp>Lagre</Hovedknapp>
            </form>
        </Ekspanderbartpanel>
    );
};

export default Vilkårsvurdering;

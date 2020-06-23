import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';

import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Languages } from '~components/TextProvider';
import * as sakSlice from '~features/saksoversikt/sak.slice';

import messages from './saksoversikt-nb';
import { Normaltekst, Element } from 'nav-frontend-typografi';

import styles from './saksoversikt.module.less';

interface FormData {
    fnr: string;
}

const Felt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.felt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const Saksoversikt = () => {
    const sakFraStore = useAppSelector((s) => s.sak.sak);
    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {
            fnr: '',
        },
        onSubmit: async (values) => {
            await dispatch(sakSlice.fetchSak({ fnr: values.fnr }));
        },
    });

    console.log({ sakFraStore });

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            <div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                    }}
                >
                    <SkjemaGruppe>
                        <Input
                            id="fnr"
                            name="fnr"
                            label={<FormattedMessage id={'input.fnr.label'} />}
                            onChange={formik.handleChange}
                            value={formik.values.fnr}
                        />
                    </SkjemaGruppe>
                    <Hovedknapp htmlType="submit" disabled={formik.isSubmitting}>
                        <FormattedMessage id={'knapp.hentSak'} />
                    </Hovedknapp>
                </form>
                {sakFraStore && (
                    <Panel className={styles.panel} border>
                        <Felt label="ID:" verdi={sakFraStore?.id} />
                        <Felt label="Opprettet dato:" verdi={new Date().toISOString()} />
                        <Felt label="Status:" verdi="UBEHANDLET" />

                        <Hovedknapp htmlType="submit" disabled={formik.isSubmitting}>
                            <FormattedMessage id={'knapp.startFørstegangsbehandling'} />
                        </Hovedknapp>
                    </Panel>
                )}
            </div>
        </IntlProvider>
    );
};

export default Saksoversikt;

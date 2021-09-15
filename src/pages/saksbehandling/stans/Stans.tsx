import { yupResolver } from '@hookform/resolvers/yup';
import { History } from 'history';
import { Knapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router-dom';

import DatePicker from '~components/datePicker/DatePicker';
import { opprettRevurdering } from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from './stans-nb';
import styles from './stans.module.less';
import StansOppsummering from './stansOppsummering';

interface Props {
    sak: Sak;
}

interface FormData {
    stansDato: Nullable<Date>;
}
const Stans = (props: Props) => {
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.stansRoute>();

    const { intl } = useI18n({ messages });

    const [, setRevurdering] = useAsyncActionCreator(opprettRevurdering);

    const { ...form } = useForm<FormData>({
        defaultValues: {
            stansDato: null,
        },
        resolver: yupResolver(
            yup.object<FormData>({
                stansDato: yup.date(),
            })
        ),
    });

    return (
        <Switch>
            <Route path={Routes.stansOppsummeringRoute.path}>
                <StansOppsummering sak={props.sak} />
            </Route>
            <Route path="*">
                <form
                    className={styles.pageContainer}
                    onSubmit={form.handleSubmit((values) => {
                        setRevurdering(
                            {
                                sakId: urlParams.sakId,
                                fraOgMed: values.stansDato!,
                                årsak: OpprettetRevurderingGrunn.STANS,
                                informasjonSomRevurderes: [],
                                begrunnelse: 'null',
                            },
                            (opprettetRevurdering) => {
                                history.push(
                                    Routes.stansOppsummeringRoute.createURL({
                                        sakId: urlParams.sakId,
                                        revurderingId: opprettetRevurdering.id,
                                    })
                                );
                            }
                        );
                    })}
                >
                    <Innholdstittel className={styles.tittel}>
                        {intl.formatMessage({ id: 'stans.tittel' })}
                    </Innholdstittel>
                    <div className={styles.content}>
                        <div className={styles.select}>
                            <Select className={styles.select}>
                                <option>{intl.formatMessage({ id: 'stans.årsak.label' })}</option>
                                <option>Manglende kontrollerklæring</option>
                            </Select>
                        </div>

                        <div className={styles.datepicker}>
                            <Controller
                                control={form.control}
                                name="stansDato"
                                render={({ field, fieldState }) => (
                                    <DatePicker
                                        label={intl.formatMessage({ id: 'stans.dato.label' })}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                        isClearable
                                        autoComplete="off"
                                        value={field.value}
                                        onChange={(date: Date | null) => field.onChange(date)}
                                        feil={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className={styles.bunnknapper}>
                            <Bunnknapper history={history} />
                        </div>
                    </div>
                </form>
            </Route>
        </Switch>
    );
};

// todo ai: trekk denna ut i egen fil
const Bunnknapper = (props: { history: History }) => (
    <div>
        <Knapp
            onClick={() => {
                props.history.goBack();
            }}
            htmlType="button"
        >
            Tilbake
        </Knapp>
        <Knapp>Neste</Knapp>
    </div>
);

export default Stans;

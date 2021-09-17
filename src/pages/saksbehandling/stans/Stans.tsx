import { yupResolver } from '@hookform/resolvers/yup';
import { Knapp } from 'nav-frontend-knapper';
import { Select, Textarea } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router-dom';

import DatePicker from '~components/datePicker/DatePicker';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { StansAvYtelse } from '~types/Stans';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import messages from './stans-nb';
import styles from './stans.module.less';
import StansOppsummering from './stansOppsummering';

interface Props {
    sak: Sak;
}

interface FormData {
    årsak: Nullable<OpprettetRevurderingGrunn>;
    stansDato: Nullable<Date>;
    begrunnelse: string;
}

function hentDefaultVerdier(r: Nullable<Revurdering>): FormData {
    if (r) {
        return {
            stansDato: new Date(r.periode.fraOgMed),
            begrunnelse: r.begrunnelse ?? '',
            årsak: null,
        };
    }

    return {
        stansDato: null,
        begrunnelse: '',
        årsak: null,
    };
}

const Stans = (props: Props) => {
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.stansRoute>();
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId) ?? null;

    const { intl } = useI18n({ messages });

    const [, opprettStans] = useAsyncActionCreator(revurderingActions.opprettStans);
    const [, oppdaterStans] = useAsyncActionCreator(revurderingActions.oppdaterStans);

    const { ...form } = useForm<FormData>({
        defaultValues: hentDefaultVerdier(revurdering),
        resolver: yupResolver(
            yup.object<FormData>({
                stansDato: yup.date(),
                begrunnelse: yup.string(),
                årsak: yup
                    .mixed()
                    .required()
                    .oneOf(Object.values([OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING])),
            })
        ),
    });

    const handleSubmit = async (values: FormData) => {
        const revurderingId = urlParams.revurderingId;
        const args = {
            sakId: urlParams.sakId,
            fraOgMed: values.stansDato!,
            årsak: OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING,
            begrunnelse: values.begrunnelse,
        };
        const onSuccess = (stansAvYtelse: StansAvYtelse) => {
            history.push(
                Routes.stansOppsummeringRoute.createURL({
                    sakId: urlParams.sakId,
                    revurderingId: stansAvYtelse.id,
                })
            );
        };

        revurderingId ? oppdaterStans({ ...args, revurderingId }, onSuccess) : opprettStans(args, onSuccess);
    };

    return (
        <Switch>
            <Route path={Routes.stansOppsummeringRoute.path}>
                <StansOppsummering sak={props.sak} />
            </Route>
            <Route path="*">
                <form className={styles.pageContainer} onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
                    <Innholdstittel className={styles.tittel}>
                        {intl.formatMessage({ id: 'stans.tittel' })}
                    </Innholdstittel>
                    <div className={styles.content}>
                        <div className={styles.select}>
                            <Controller
                                control={form.control}
                                name="årsak"
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? undefined}
                                        onChange={field.onChange}
                                        className={styles.select}
                                    >
                                        <option>{intl.formatMessage({ id: 'stans.årsak.label' })}</option>
                                        <option value={OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING}>
                                            {getRevurderingsårsakMessageId(
                                                OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING
                                            )}
                                        </option>
                                    </Select>
                                )}
                            />
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
                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label="Begrunnelse"
                                    name="begrunnelse"
                                    value={field.value}
                                    onChange={field.onChange}
                                    feil={fieldState.error}
                                />
                            )}
                        />
                        <div className={styles.bunnknapper}>
                            <Knapp
                                onClick={() => {
                                    if (urlParams.revurderingId) {
                                        return history.push(
                                            Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })
                                        );
                                    }
                                    history.goBack();
                                }}
                                htmlType="button"
                            >
                                Tilbake
                            </Knapp>
                            <Knapp>Neste</Knapp>
                        </div>
                    </div>
                </form>
            </Route>
        </Switch>
    );
};

export default Stans;

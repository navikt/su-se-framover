import yup from '~src/lib/validering';

export interface SkattFormData {
    fra: string;
    til: string;
}

export const skattFormSchema = yup.object<SkattFormData>({
    fra: yup
        .string()
        .test({
            name: 'fra',
            message: 'Fra år må være 2020 eller etter',
            test: function (value) {
                if (!value) {
                    return false;
                }
                return parseInt(value, 10) >= 2020;
            },
        })
        .defined(),
    til: yup
        .string()
        .test({
            name: 'til',
            message: 'Til år må være lik fra år, eller etter',
            test: function (value) {
                if (!value) {
                    return false;
                }
                const fra = parseInt(this.parent.fra, 10);
                const til = parseInt(value, 10);
                return fra <= til;
            },
        })
        .defined(),
});

import { FormikProps } from 'formik';

export async function customFormikSubmit<T>(f: FormikProps<T>, funn: (values: T) => Promise<void>) {
    f.setSubmitting(true);
    try {
        const errors = await f.validateForm();
        if (Object.keys(errors).length === 0) {
            await funn(f.values);
        }
    } finally {
        f.setSubmitting(false);
    }
}

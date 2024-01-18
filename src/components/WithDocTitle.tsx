import { ComponentType } from 'react';

import { useDocTitle } from '../lib/hooks';

function WithDocTitle<T>({ title, Page }: { title: string; Page: ComponentType<Partial<T>> }) {
    useDocTitle(title);
    return <Page />;
}

export default WithDocTitle;

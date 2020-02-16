import { useGet } from './useGet';
import { usePost } from './usePost';

const useReauthenticationgFetch = ({ method = 'get', ...args }) => {
    const getData = useGet(args && /get/i.test(method) ? { ...args } : {});
    const postData = usePost(args && /post/i.test(method) ? { ...args } : {});

    return method === 'get' ? { ...getData } : { ...postData };
};

export default useReauthenticationgFetch;

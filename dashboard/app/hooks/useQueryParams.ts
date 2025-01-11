import { useLocation } from "react-router";

export default function useQueryParams() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    let params: any = {};

    for (let param of searchParams) {
        params[param[0]] = param[1];
    }

    return params;
}

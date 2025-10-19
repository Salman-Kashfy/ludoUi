import {apiUrl} from "../utils/constants";
import {POST,GET} from "./api.service.wrapper";

interface DashboardStatsInput {
    companyId: string,
}

export const TableStats = async (params:DashboardStatsInput): Promise<any> => {
    return GET(apiUrl.tableStats, params);
}
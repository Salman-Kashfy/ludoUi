import { apiUrl } from "../utils/constants";
import { GET } from "./api.service.wrapper";

interface BillingTotalInterface {
    companyUuid: string;
    tableUuid: string;
    categoryPriceUuid: string;
    paymentMethod: string
}

export const TableSessionBilling = async (params:BillingTotalInterface) => {
    const response = await GET(apiUrl.tableSessionBilling, params);
    return response.status ? response.data : {}
}
import { constants } from "../utils/constants";
import { emptyListResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

export const GetCustomers = async ({page = 1, limit = constants.PER_PAGE}, params = {}): Promise<any> => {
    const query = `
        query Customers($paging: PaginatorInput, $params: CustomerFilter) {
            customers(paging: $paging, params: $params) {
                list {
                    uuid
                    firstName
                    lastName
                    phoneCode
                    phoneNumber
                    fullName
                    phone
                }
                paging {
                    totalPages
                    totalResultCount
                }
            }
        }
    `;

    const variables = {
        params,
        paging: { page, limit }
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.customers?.list?.length
        ? response?.data?.customers
        : emptyListResponse;
};
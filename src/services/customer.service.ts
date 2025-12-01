import { constants, emptyListResponse, emptyMutationResponse } from "../utils/constants";
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
                    createdAt
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

export const SaveCustomer = async (data: any): Promise<any> => {
    const query = `
        mutation SaveCustomer($input: SaveCustomerInput!) {
            saveCustomer(input: $input) {
                data {
                    uuid
                    firstName
                    lastName
                    phoneCode
                    phoneNumber
                    fullName
                    phone
                }
                errors
                status
                errorMessage
            }
        }
    `;
    const variables = {
        input: data
    };
    const response: any = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.saveCustomer || emptyMutationResponse;
};
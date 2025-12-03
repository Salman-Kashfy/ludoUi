import { constants, emptyListResponse, emptyMutationResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

export const GetUsers = async ({page = 1, limit = constants.PER_PAGE}, params = {}): Promise<any> => {
    const query = `
        query Users($paging: PaginatorInput, $params: UserFilter) {
            users(paging: $paging, params: $params) {
                list {
                    uuid
                    firstName
                    middleName
                    lastName
                    fullName
                    email
                    phoneCode
                    phoneNumber
                    role {
                        id
                        name
                    }
                    status
                    gender
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
    return response?.data?.users?.list?.length
        ? response?.data?.users
        : emptyListResponse;
};

export const SaveUser = async (data: any): Promise<any> => {
    const mutation = data.uuid ? 'updateUser' : 'createUser';
    const inputType = data.uuid ? 'UpdateUserInput!' : 'CreateUserInput!';
    
    const query = `
        mutation ${mutation}($input: ${inputType}) {
            ${mutation}(input: $input) {
                data {
                    uuid
                    firstName
                    middleName
                    lastName
                    fullName
                    email
                    phoneCode
                    phoneNumber
                    role {
                        id
                        name
                    }
                    status
                    gender
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
    return response?.data?.[mutation] || emptyMutationResponse;
};


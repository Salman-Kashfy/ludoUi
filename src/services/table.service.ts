import {constants, emptyListResponse, emptyMutationResponse} from "../utils/constants";
import {POST} from "./api.service.wrapper";

interface GetTablesInput {
    companyUuid: string;
}

export const GetTables = async (params: GetTablesInput): Promise<any> => {
    const query = `
        query Tables($params: TableFilter) {
            tables(params: $params) {
                data {
                    uuid
                    name
                    sortNo
                    category {
                        uuid
                        name
                    }
                }
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.tables?.data?.length
        ? { list: response?.data?.tables?.data }
        : emptyListResponse;
};

export const GetTable = async (uuid:string): Promise<any> => {
    const query = `
        query Table($uuid: ID!) {
            table(uuid: $uuid) {
                data {
                    uuid
                    name
                    sortNo
                    category {
                        uuid
                        name
                    }
                }
            }
        }
    `;

    const variables = {
        uuid
    }

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.table?.data || {}
};

export const SaveTable = async (data:any): Promise<any> => {
    const query = `
        mutation SaveTable($input: SaveTableInput!) {
            saveTable(input: $input) {
                data {
                    uuid
                }
                errors
                status
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveTable || emptyMutationResponse
}

export const DeleteTable = async (uuid:string): Promise<any> => {
    const query = `
        mutation DeleteTable($uuid: ID!) {
            deleteTable(uuid: $uuid) {
                data
                errors
                status
                errorMessage
            }
        }
    `
    const variables = {
        uuid
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.deleteTable || emptyMutationResponse
}


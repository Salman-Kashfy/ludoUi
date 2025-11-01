import {constants, emptyListResponse} from "../utils/constants";
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
                    status
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


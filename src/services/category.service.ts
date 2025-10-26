import {constants, emptyListResponse} from "../utils/constants";
import {POST} from "./api.service.wrapper";

interface GetCategoriesInput {
    companyUuid: string;
}

export const GetCategories = async (params: GetCategoriesInput): Promise<any> => {
    const query = `
        query Categories($params: CategoryFilter) {
            categories(params: $params) {
                list {
                    uuid
                    name
                    hourlyRate
                    currencyName
                    tables {
                        uuid
                        name
                        tableSessions {
                            uuid
                            startTime
                            unit
                            duration
                            status
                        }
                    }
                }
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.categories?.list?.length
        ? response?.data?.categories
        : emptyListResponse;
};
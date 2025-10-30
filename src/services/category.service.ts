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
                    categoryPrices {
                        uuid
                        price
                        unit
                        duration
                        freeMins
                        currencyName
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

export const GetCategory = async (uuid:string): Promise<any> => {
    const query = `
        query Category($uuid: ID!) {
            category(uuid: $uuid) {
                data {
                    uuid
                    name
                    hourlyRate
                    currencyName
                    categoryPrices {
                        uuid
                        price
                        unit
                        duration
                        currencyName
                    }
                }
            }
        }
    `;

    const variables = {
        uuid
    }

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.category.data || {}
};
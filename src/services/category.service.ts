import {constants, emptyListResponse, emptyMutationResponse} from "../utils/constants";
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
                        status
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
                        freeMins
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

export const SaveCategory = async (data:any): Promise<any> => {
    const query = `
        mutation SaveCategory($input: SaveCategoryInput!) {
            saveCategory(input: $input) {
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
    return response?.data?.saveCategory || emptyMutationResponse
}
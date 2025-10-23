import {constants, emptyListResponse} from "../utils/constants";
import {POST} from "./api.service.wrapper";

interface GetCategoriesInput {
    companyUuid: string;
}

interface StartTableSessionInput {
    tableId: string;
}

interface StopTableSessionInput {
    tableSessionId: string;
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
                            endTime
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

export const StartTableSession = async (params: StartTableSessionInput): Promise<any> => {
    const query = `
        mutation StartTableSession($params: StartTableSessionInput!) {
            startTableSession(params: $params) {
                uuid
                startTime
                endTime
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.startTableSession;
};

export const StopTableSession = async (params: StopTableSessionInput): Promise<any> => {
    const query = `
        mutation StopTableSession($params: StopTableSessionInput!) {
            stopTableSession(params: $params) {
                uuid
                startTime
                endTime
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.stopTableSession;
};

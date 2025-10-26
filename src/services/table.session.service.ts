import { constants, emptyMutationResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

interface BookTableSessionInput {
    tableUuid: string;
    customerUuid: string;
    paymentMethod: any;
    hours: number;
    companyUuid: string;
}

interface StartTableSessionInput {
    companyUuid: string;
    tableSessionUuid: string;
}

interface StopTableSessionInput {
    tableSessionId: string;
}

export const BookTableSession = async (input:BookTableSessionInput) => {
    const query = `
        mutation BookTableSession($input: BookTableSessionInput!) {
            bookTableSession(input: $input) {
                data {
                    uuid
                    startTime
                }
                status
                errors
                errorMessage
            }
        }
    `
    const variables = {
        input
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.bookTableSession || emptyMutationResponse
}

export const StartTableSession = async (input:StartTableSessionInput): Promise<any> => {
    const query = `
        mutation StartTableSession($input: StartTableSessionInput!) {
            startTableSession(input: $input) {
                data {
                    uuid
                    startTime
                    duration
                    unit
                    status
                }
                status
                errors
                errorMessage
            }
        }
    `;

    const variables = {
        input
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.startTableSession || emptyMutationResponse;
};

export const StopTableSession = async (input:StopTableSessionInput): Promise<any> => {
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
        input
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.stopTableSession || emptyMutationResponse;
};

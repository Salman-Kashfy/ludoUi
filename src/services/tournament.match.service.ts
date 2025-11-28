import { constants, emptyListResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

export interface TournamentMatchFilter {
    tournamentUuid: string;
    round?: number;
    tableUuid?: string;
    tableId?: number;
}

export const GetTournamentMatches = async (params: TournamentMatchFilter): Promise<any> => {
    const query = `
        query TournamentMatches($params: TournamentMatchFilter!) {
            tournamentMatches(params: $params) {
                status
                list {
                    tournamentRoundId
                    tournamentRoundUuid
                    round
                    tableId
                    table {
                        id
                        uuid
                        name
                    }
                    players {
                        customerId
                        customerUuid
                        isWinner
                        customer {
                            uuid
                            fullName
                            phone
                        }
                    }
                }
                errors
                errorMessage
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.tournamentMatches || emptyListResponse;
};


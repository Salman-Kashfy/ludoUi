import { constants, emptyListResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

export interface TournamentRoundPlayerFilter {
    tournamentRoundUuid?: string;
    tournamentRoundId?: number;
    tableId?: number;
    customerId?: number;
    winnersOnly?: boolean;
}

export const TournamentRoundPlayers = async (params: TournamentRoundPlayerFilter): Promise<any> => {
    const query = `
        query TournamentRoundPlayers($params: TournamentRoundPlayerFilter!) {
            tournamentRoundPlayers(params: $params) {
                list {
                    id
                    isWinner
                    table {
                        id
                        uuid
                        name
                    }
                    customer {
                        uuid
                        fullName
                        phone
                    }
                    tableId
                    customerId
                }
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.tournamentRoundPlayers || emptyListResponse;
};


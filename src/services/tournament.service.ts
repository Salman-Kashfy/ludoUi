import {constants, emptyListResponse, emptyMutationResponse} from "../utils/constants";
import {POST} from "./api.service.wrapper";

interface GetTournamentsInput {
    companyUuid: string;
    searchText?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export const GetTournaments = async (params: GetTournamentsInput, paging?: any): Promise<any> => {
    const query = `
        query Tournaments($paging: PaginatorInput, $params: TournamentFilter) {
            tournaments(paging: $paging, params: $params) {
                list {
                    uuid
                    name
                    date
                    startTime
                    entryFee
                    prizePool
                    currencyName
                    playerCount
                    playerLimit
                    totalRounds
                    status
                    category {
                        uuid
                        name
                    }
                    createdAt
                    updatedAt
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
        paging: paging || null
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.tournaments?.list?.length
        ? response?.data?.tournaments
        : emptyListResponse;
};

export const GetTournament = async (uuid:string): Promise<any> => {
    const query = `
        query Tournament($uuid: ID!) {
            tournament(uuid: $uuid) {
                data {
                    uuid
                    name
                    date
                    startTime
                    entryFee
                    prizePool
                    currencyName
                    groupSize
                    playerCount
                    playerLimit
                    status
                    createdAt
                    updatedAt
                    category {
                        uuid
                        name
                    }
                }
                errors
                status
                errorMessage
            }
        }
    `;

    const variables = {
        uuid
    }

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.tournament?.data || {}
};

export const SaveTournament = async (data:any): Promise<any> => {
    const query = `
        mutation SaveTournament($input: SaveTournamentInput!) {
            saveTournament(input: $input) {
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
    return response?.data?.saveTournament || emptyMutationResponse
}

export const DeleteTournament = async (uuid:string): Promise<any> => {
    const query = `
        mutation DeleteTournament($uuid: ID!) {
            deleteTournament(uuid: $uuid) {
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
    return response?.data?.deleteTournament || emptyMutationResponse
}

export const GetTournamentPlayers = async (tournamentUuid: string): Promise<any> => {
    const query = `
        query TournamentPlayers($tournamentUuid: ID!) {
            tournamentPlayers(tournamentUuid: $tournamentUuid) {
                list {
                    customer {
                        fullName
                    }
                    table {
                        name
                    }
                }
            }
        }
    `;

    const variables = {
        tournamentUuid
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.tournamentPlayers?.list?.length
        ? response?.data?.tournamentPlayers
        : emptyListResponse;
};

export const PlayerRegistrationBill = async (params: any): Promise<any> => {
    const query = `
        query PlayerRegistrationBill($params: PlayerRegistrationBillInput!) {
            playerRegistrationBill(params: $params) {
                data {
                    name
                    entryFee
                    currencyName
                }
                status
                errorMessage
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.playerRegistrationBill || emptyMutationResponse;
};

export const PlayerRegistration = async (input: any): Promise<any> => {
    const query = `
        mutation PlayerRegistration($input: PlayerRegistrationInput!) {
            playerRegistration(input: $input) {
                data {
                    uuid
                    playerCount
                }
                errors
                status
                errorMessage
            }
        }
    `;

    const variables = {
        input
    };

    const response = await POST(constants.GRAPHQL_SERVER, {query, variables});
    return response?.data?.playerRegistration || emptyMutationResponse;
};


import { constants, emptyListResponse, emptyMutationResponse } from "../utils/constants";
import { POST } from "./api.service.wrapper";

interface TournamentRoundsInput {
    tournamentUuid: string;
    round: number;
}

export const TournamentRounds = async (params: TournamentRoundsInput): Promise<any> => {
    const query = `
        query TournamentRounds($params: TournamentRoundFilter!) {
            tournamentRounds(params: $params) {
                list {
                    id
                    uuid
                    round
                    status
                    playerCount
                    tableCount
                    table {
                        uuid
                        name
                        customers {
                            uuid
                            phone
                            isWinner
                        }
                    }
                }
            }
        }
    `;

    const variables = {
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.tournamentRounds || emptyListResponse;
};

export const GetAllTournamentRounds = async (tournamentUuid: string): Promise<any> => {
    const query = `
        query TournamentAllRounds($tournamentUuid: ID!) {
            tournamentAllRounds(tournamentUuid: $tournamentUuid) {
                list {
                    id
                    uuid
                    round
                    status
                    playerCount
                    tableCount
                    startedAt
                    completedAt
                    table {
                        uuid
                        name
                        customers {
                            uuid
                            phone
                            isWinner
                        }
                    }
                }
            }
        }
    `;

    const variables = {
        tournamentUuid
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.tournamentAllRounds || emptyListResponse;
};

export const TournamentRound = async (tournamentUuid: string, round: number): Promise<any> => {
    const query = `
        query TournamentRound($tournamentUuid: ID!, $round: Int!) {
            tournamentRound(tournamentUuid: $tournamentUuid, round: $round) {
                status
                data {
                    round {
                        uuid
                        round
                        playerCount
                        tableCount
                        status
                        startedAt
                    }
                    tables {
                        table {
                            uuid
                            name
                        }
                        players {
                            customerId
                            customerUuid
                            isWinner
                            customer {
                                uuid
                                firstName
                                lastName
                                fullName
                                phone
                            }
                        }
                    }
                }
                errors
                errorMessage
            }
        }
    `;

    const variables = {
        tournamentUuid,
        round
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.tournamentRound || emptyMutationResponse;
};

export const StartTournament = async (input: any): Promise<any> => {
    const query = `
        mutation StartTournament($input: StartTournamentInput!) {
            startTournament(input: $input) {
                data {
                    tournament {
                        uuid
                        status
                        currentRound
                        startedAt
                    }
                    round {
                        uuid
                        round
                        playerCount
                        tableCount
                        startedAt
                        status
                    }
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

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.startTournament || emptyMutationResponse;
};

export const StartNextTournamentRound = async (input: any): Promise<any> => {
    const query = `
        mutation StartNextTournamentRound($input: StartNextTournamentRoundInput!) {
            startNextTournamentRound(input: $input) {
                data {
                    tournament {
                        uuid
                        status
                        currentRound
                        startedAt
                        completedAt
                    }
                    round {
                        uuid
                        round
                        playerCount
                        tableCount
                        startedAt
                        status
                    }
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

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.startNextTournamentRound || emptyMutationResponse;
};

export const CompleteTournamentRound = async (input: any): Promise<any> => {
    const query = `
        mutation CompleteTournamentRound($input: CompleteTournamentRoundInput!) {
            completeTournamentRound(input: $input) {
                status
                errorMessage
                data {
                    uuid
                    status
                    currentRound
                    completedAt
                }
            }
        }
    `;

    const variables = {
        input
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query: query.trim(), variables });
    return response?.data?.completeTournamentRound || emptyMutationResponse;
};


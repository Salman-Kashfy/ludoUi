import { constants } from '../utils/constants';
import { POST } from './api.service.wrapper';

export interface RevenueSource {
    source: string;
    revenue: number;
}

export interface PaymentChartParams {
    companyUuid: string;
    startDate?: string;
    endDate?: string;
}

export const GetPaymentCharts = async (params: PaymentChartParams): Promise<RevenueSource[]> => {
    const query = `
        query PaymentCharts($companyUuid: String!, $startDate: String, $endDate: String) {
            paymentCharts(companyUuid: $companyUuid, startDate: $startDate, endDate: $endDate) {
                list {
                    source
                    revenue
                }
            }
        }
    `;

    const variables = {
        companyUuid: params.companyUuid,
        startDate: params.startDate || null,
        endDate: params.endDate || null
    };

    const response: any = await POST(constants.GRAPHQL_SERVER, {
        query: query.trim(),
        variables
    });

    // Ensure we always return an array
    return response?.data?.paymentCharts?.list ?? [];
};

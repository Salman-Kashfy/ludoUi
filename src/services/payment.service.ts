import { GET, POST } from "./api.service.wrapper";
import { constants, emptyListResponse, apiUrl } from "../utils/constants";

interface BillingTotalInterface {
    companyUuid: string;
    tableUuid: string;
    categoryPriceUuid: string;
    paymentMethod: string;
    hours: number;
}

// Extend PaymentsParams to include companyUuid and optional date filters
export interface PaymentsParams {
    companyUuid: string;          // required
    startDate?: string;           // optional ISO string
    endDate?: string;             // optional ISO string
    searchText?: string;
    customerId?: number;
    status?: string;
    method?: string;
    tournamentUuid?: string;
}

export const Payments = async (
    { page = 1, limit = constants.PER_PAGE },
    params: PaymentsParams
): Promise<any> => {
    const query = `
      query Payments($paging: PaginatorInput, $params: PaymentFilter) {
        payments(paging: $paging, params: $params) {
          list {
            uuid
            amount
            method
            status
            refundNote
            refundedAt
            createdAt
            customer {
              uuid
              fullName
              phone
            }
            invoiceId
            taxAmount
            taxRate
            totalAmount
            tournamentId
            tableSessionId
          }
          paging {
            totalPages
            totalResultCount
          }
        }
      }
    `;

    const variables = {
        paging: { page, limit },
        params
    };

    const response = await POST(constants.GRAPHQL_SERVER, { query, variables });

    const payments = response?.data?.payments;
    return payments?.list?.length ? payments : emptyListResponse;
};


export const TableSessionBilling = async (params: BillingTotalInterface) => {
    const response = await GET(apiUrl.tableSessionBilling, params);
    return response.status ? response.data : {};
};

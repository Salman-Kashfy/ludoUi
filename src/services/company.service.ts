import {constants, emptyListResponse} from '../utils/constants';
import {POST} from "./api.service.wrapper";

export const GetCompanies = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Companies($paging: PaginatorInput, $params: CompanyFilter) {
            companies(paging: $paging, params: $params) {
                list {
                    uuid
                    name
                }
                paging {
                    totalPages
                    totalResultCount
                }
            }
        }
    `
    const variables = {
        params,
        paging: { page, limit }
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.companies?.list.length ? response?.data?.companies : emptyListResponse
}
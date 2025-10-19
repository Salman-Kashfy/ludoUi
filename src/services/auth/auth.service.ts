import {constants, apiUrl} from '../../utils/constants';
import {POST,GET} from '../api.service.wrapper.ts';

const storageKey = constants.LOCAL_STORAGE_TOKEN;
const storageAdmin = constants.LOCAL_STORAGE_USER;
const storageCompany = constants.LOCAL_STORAGE_COMPANY;
const storagePermissions = constants.LOCAL_STORAGE_PERMISSIONS;
let authUser: any, userPermissions: any

interface UserLoginInterface {
    email: string,
    password: string,
}

export const UserLogin = async (data:UserLoginInterface) => {
    const response = await POST(apiUrl.adminLogin, data);
    if(response.status){
        SetToken(response.token);
        SetAuthUser(response.user);
    }
    return response;
}

export const SetToken = (token:string) => {
    if (token) localStorage.setItem(storageKey, token);
    else localStorage.removeItem(storageKey);
}

export const SetPermissions = (permissions:any) => {
    if (permissions) {
        userPermissions = permissions
        localStorage.setItem(storagePermissions, JSON.stringify(permissions))
    }
    else localStorage.removeItem(storagePermissions);
}

export const GetPermissions = () => {
    const data = localStorage.getItem(storagePermissions);
    return data ? JSON.parse(data) : null;
}

export const GetToken = () => {
    return localStorage.getItem(storageKey);
}

export const SetAuthUser = (user_data:any) => {
    if (user_data) {
        authUser = user_data
        localStorage.setItem(storageAdmin, JSON.stringify(user_data))
    }
    else localStorage.removeItem(storageAdmin);
}

export const GetAuthUser = () => {
    const data = localStorage.getItem(storageAdmin);
    return authUser || (data ? JSON.parse(data) : null);
}

export const GetAuthCompany = () => {
    return localStorage.getItem(storageCompany) || null;
}

export const SetAuthCompany = (companyId:string) => {
    localStorage.setItem(storageCompany, companyId);
}

export const GetUserPermissions = () => {
    const data = localStorage.getItem(storagePermissions);
    return userPermissions || (data ? JSON.parse(data) : null) || []
}

export const UserPermissions = async () => {
    const response = await GET(apiUrl.userPermissions);
    if(response.status){
        SetPermissions(response.data)
    }
    return response;
}

export const Logout = async () => {
    const response = await POST(apiUrl.logout);
    authUser = null
    userPermissions = null
    return response;
}

export const EmptyLocalStorage = async () => {
    await localStorage.removeItem(storageAdmin);
    await localStorage.removeItem(storageKey)
    return await localStorage.removeItem(storagePermissions)
}

export const GetUserRole = () => {
    const user = GetAuthUser();
    if(!user?.role) return false
    return user?.role.name.toLowerCase();
}

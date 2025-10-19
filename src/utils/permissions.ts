import {ROLE} from "./constants";
import {GetUserPermissions, GetUserRole} from "../services/auth/auth.service";

export function hasPermission(permission:string):boolean {
    const permissions = GetUserPermissions()
    return permissions.includes('*') || permissions.includes(permission)
}

export function hasRole(role:ROLE):boolean {
    return GetUserRole() === role
}
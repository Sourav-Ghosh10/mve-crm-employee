import api from "./api";
import type { Department, Designation, OrganizationResponse, OfficeLocation } from "../types/organization.types";

export const organizationService = {
    getDepartments: async (params = { limit: 100, isActive: true }) => {
        const response = await api.get<OrganizationResponse<Department>>("/departments", { params });
        return response.data;
    },

    getDesignations: async (params = { limit: 100, isActive: true }) => {
        const response = await api.get<OrganizationResponse<Designation>>("/designations", { params });
        return response.data;
    },

    getOfficeLocations: async (params = { limit: 100, isActive: true }) => {
        const response = await api.get<OrganizationResponse<OfficeLocation>>("/office-locations", { params });
        return response.data;
    },
};

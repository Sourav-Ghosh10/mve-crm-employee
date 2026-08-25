export interface Department {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    employeeCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Designation {
    _id: string;
    title: string;
    department?: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}


export interface OfficeLocation {
    _id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    contactInfo: {
        phone?: string;
        email?: string;
    };
    isHeadquarters: boolean;
    isActive: boolean;
}

export interface OfficeLocation {
    _id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    contactInfo: {
        phone?: string;
        email?: string;
    };
    isHeadquarters: boolean;
    isActive: boolean;
}

export interface OrganizationResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

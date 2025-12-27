export default interface Driver {
    name: string;
    licenseNumber: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    assignedVehicle?: string;
    createdAt?: any;
    joiningDate?: any;
    salary?: number;
}
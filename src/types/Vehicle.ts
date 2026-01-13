export default interface Vehicle {
    vehicleNumber: string;        // Registration number
    vehicleType: string;          // Car, Van, Truck, Auto, etc.
    brand: string;                // Maruti, Tata, Hyundai...
    model: string;                // Swift, Nexon, etc.
    manufacturingYear?: number;
    color?: string;

    ownerName?: string;
    ownerPhone?: string;

    insuranceNumber?: string;
    insuranceExpiry?: Date;

    fitnessExpiry?: Date;
    permitExpiry?: Date;
    pollutionExpiry?: Date;

    assignedDriver?: string;      // Driver ID or name
    status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

    createdAt?: Date;
    updatedAt?: Date;
}

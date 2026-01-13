import { ownerLists } from "./constants";

export const getownerName = (id: string) => {
    //function to get owner name from ownerLists based on uid
    return ownerLists.find((owner) => owner.uid == id)?.displayName || "Unknown";
}

export const capitalizeWords = (str: string) => {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export const makeAllCaps = (str: string) => {
    return str.toUpperCase();
}

export function formatDateMMDDYYYY(
    date: string | Date | null = null
): string {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
}

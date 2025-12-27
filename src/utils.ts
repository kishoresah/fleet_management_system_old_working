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
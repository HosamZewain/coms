import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getProfileImageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) {
        return `http://localhost:3000${path}`;
    }
    return path;
};

export const getFileUrl = getProfileImageUrl;

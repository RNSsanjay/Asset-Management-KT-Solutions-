import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const getStatusColor = (status) => {
    const colors = {
        Available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Under Repair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Scrapped: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getConditionColor = (condition) => {
    const colors = {
        Excellent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        Fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Poor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
};

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';

export default function ConfirmDialog({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', destructive = false, onCancel, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-lg shadow-lg w-full max-w-md m-4"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
                        <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>{confirmText}</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

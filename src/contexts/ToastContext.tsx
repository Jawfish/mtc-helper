import { createContext, useContext } from 'react';
import { TypeOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type IToastContext = {
    notify: (message: string, type: TypeOptions) => void;
};

export const ToastContext = createContext<IToastContext | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const notify = (message: string, type: TypeOptions) => {
        toast(message, { type });
    };

    return <ToastContext.Provider value={{ notify }}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
};

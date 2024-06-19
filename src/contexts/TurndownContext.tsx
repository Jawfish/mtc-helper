import { createContext, useContext } from 'react';
import TurndownService from 'turndown'; // or wherever you import it from

const TurndownContext = createContext<TurndownService | null>(null);

export const TurndownProvider = ({ children }: { children: React.ReactNode }) => {
    const turndownService = new TurndownService();

    return (
        <TurndownContext.Provider value={turndownService}>
            {children}
        </TurndownContext.Provider>
    );
};

export const useTurndownService = () => {
    const context = useContext(TurndownContext);
    if (context === null) {
        throw new Error('useTurndownService must be used within a TurndownProvider');
    }

    return context;
};

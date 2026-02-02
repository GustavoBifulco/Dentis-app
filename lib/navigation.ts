import { ViewType } from '../types';

/**
 * Lógica de navegação para aplicativos que não usam roteador baseado em URL.
 * Mantém uma pilha básica para permitir a funcionalidade "Voltar".
 */
export const useNavigation = (
    currentView: ViewType,
    setView: (view: ViewType) => void,
    history: ViewType[],
    setHistory: (history: ViewType[]) => void
) => {
    const navigate = (view: ViewType) => {
        if (view === currentView) return;
        setHistory([...history, currentView]);
        setView(view);
    };

    const goBack = () => {
        if (history.length === 0) {
            setView(ViewType.DASHBOARD);
            return;
        }
        const newHistory = [...history];
        const previousView = newHistory.pop();
        if (previousView !== undefined) {
            setHistory(newHistory);
            setView(previousView);
        }
    };

    return { navigate, goBack, history };
};

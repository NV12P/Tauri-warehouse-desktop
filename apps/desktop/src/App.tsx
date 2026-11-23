import { useCallback, useEffect, useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { authService } from './features/auth/authService';
import { User } from './features/auth/types';
import { setUnauthorizedHandler } from './services/apiClient';
import { MainLayout } from './layouts/MainLayout';
import { CategoryPage } from './features/master-data/categories/CategoryPage';
import { ItemPage } from './features/master-data/items/ItemPage';
import { StockTransactionPage } from './features/inventory/StockTransactionPage';
import { StockMovementPage } from './features/inventory/StockMovementPage';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import './design-tokens.css';
import './components/ui-components.css';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(authService.getStoredUser() && authService.getStoredToken())
  );
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'categories' | 'items' | 'transactions' | 'movements'
  >('dashboard');

  const handleEnterApp = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onEnterApp={handleEnterApp} />;
  }

  return (
    <MainLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onLogout={handleLogout}
      user={currentUser}
    >
      {currentTab === 'dashboard' && (
        <DashboardOverview
          user={currentUser}
          onNavigateToCategories={() => setCurrentTab('categories')}
          onNavigateToItems={() => setCurrentTab('items')}
          onNavigateToTransactions={() => setCurrentTab('transactions')}
        />
      )}
      {currentTab === 'categories' && <CategoryPage />}
      {currentTab === 'items' && <ItemPage />}
      {currentTab === 'transactions' && <StockTransactionPage />}
      {currentTab === 'movements' && <StockMovementPage />}
    </MainLayout>
  );
}

export default App;

import { useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { authService } from './features/auth/authService';
import { User } from './features/auth/types';
import { MainLayout } from './layouts/MainLayout';
import { CategoryPage } from './features/master-data/categories/CategoryPage';
import { ItemPage } from './features/master-data/items/ItemPage';
import { StockTransactionPage } from './features/inventory/StockTransactionPage';
import { DashboardOverview } from './features/dashboard/DashboardOverview';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'categories' | 'items' | 'transactions'>('categories');

  const handleEnterApp = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentTab('categories');
  };

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
      {currentTab === 'categories' && <CategoryPage />}
      {currentTab === 'dashboard' && (
        <DashboardOverview
          user={currentUser}
          onNavigateToCategories={() => setCurrentTab('categories')}
          onNavigateToItems={() => setCurrentTab('items')}
          onNavigateToTransactions={() => setCurrentTab('transactions')}
        />
      )}
      {currentTab === 'items' && <ItemPage />}
      {currentTab === 'transactions' && <StockTransactionPage />}
    </MainLayout>
  );
}

export default App;

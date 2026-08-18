import { Routes, Route } from 'react-router-dom';
import { GenLayerProvider } from './hooks/useGenLayer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { NewMilestonePage } from './pages/NewMilestonePage';
import { VaultsListPage } from './pages/VaultsListPage';
import { VaultDetailPage } from './pages/VaultDetailPage';
import { DocsPage } from './pages/DocsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <GenLayerProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/new" element={<NewMilestonePage />} />
              <Route path="/vaults" element={<VaultsListPage />} />
              <Route path="/vaults/:id" element={<VaultDetailPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </GenLayerProvider>
    </ErrorBoundary>
  );
}

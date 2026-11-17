import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { reloadWithFreshCache } from '../../lib/utils';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo);
  }

  handleReload = async () => {
    await reloadWithFreshCache();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      const errorMsg = String(this.state.error?.message || '').toLowerCase();
      const isChunkError =
        errorMsg.includes('dynamically imported module') ||
        errorMsg.includes('loading chunk') ||
        errorMsg.includes('importing a module script failed');

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isChunkError ? 'Actualización disponible' : 'Algo no salió como esperábamos'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isChunkError
                  ? 'La aplicación se actualizó. Recarga con caché limpio o reintenta para continuar.'
                  : 'Ocurrió un error inesperado al cargar este elemento. Puedes intentar recargar.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary py-2 px-4 text-xs font-semibold gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Recargar página</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import PaginaPrincipal from './Pages/PaginaPrincipal';
import Agendamentos from './Pages/Agendamentos';
import MeusAgendamentos from './Pages/MeusAgendamentos';
import Cadastro from './Pages/Cadastro';
import Sobrenos from './Pages/Sobrenos';
import Login from './Pages/Login';
import Barbeiro from './Pages/Barbeiro';
import EsqueciSenha from './Pages/EsqueciSenha';
import ResetSenha from './Pages/ResetSenha';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/reset-senha/:token" element={<ResetSenha />} />
            <Route
              path="/paginaprincipal"
              element={
                <ProtectedRoute>
                  <PaginaPrincipal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos"
              element={
                <ProtectedRoute>
                  <Agendamentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-agendamentos"
              element={
                <ProtectedRoute>
                  <MeusAgendamentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/barbeiro"
              element={
                <ProtectedRoute allowedRoles={['barbeiro']}>
                  <Barbeiro />
                </ProtectedRoute>
              }
            />
            <Route path="/sobrenos" element={<Sobrenos />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;

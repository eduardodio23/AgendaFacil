import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './Components/Header'
import Footer from './Components/Footer'
import PaginaPrincipal from './Pages/PaginaPrincipal'
import Agendamentos from './Pages/Agendamentos'
import Cadastro from './Pages/Cadastro'
import Sobrenos from './Pages/Sobrenos'
import Login from './Pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/paginaprincipal" element={<PaginaPrincipal />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/sobrenos" element={<Sobrenos />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/authService';

// Pages publiques
import Inscription from './pages/public/Inscription';

// Pages admin
import Login           from './pages/admin/Login';
import Dashboard       from './pages/admin/Dashboard';
import Eleves          from './pages/admin/Eleves';
import EleveDetail     from './pages/admin/EleveDetail';
import AnneesScolaires from './pages/admin/AnneesScolaires';
import Classes         from './pages/admin/Classes';
import Enseignants     from './pages/admin/Enseignants';
import Presences       from './pages/admin/Presences';
import Notes           from './pages/admin/Notes';
import Bulletins       from './pages/admin/Bulletins';
import Rapports        from './pages/admin/Rapports';

// Pages enseignant web
import EnseignantLogin     from './pages/enseignant/EnseignantLogin';
import EnseignantRegister  from './pages/enseignant/EnseignantRegister';
import EnseignantDashboard from './pages/enseignant/EnseignantDashboard';
import EnseignantNotes     from './pages/enseignant/EnseignantNotes';
import EnseignantPresences from './pages/enseignant/EnseignantPresences';

// ── Guards ─────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated()
    ? children
    : <Navigate to="/admin/login" replace/>;
};

const EnseignantRoute = ({ children }) => {
  return authService.isEnseignantAuthenticated()
    ? children
    : <Navigate to="/enseignant/login" replace/>;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Routes>

        {/* ── Public ── */}
        <Route path="/inscription" element={<Inscription/>}/>

        {/* ── Admin ── */}
        <Route path="/admin/login" element={<Login/>}/>
        <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
        <Route path="/admin/eleves" element={<PrivateRoute><Eleves/></PrivateRoute>}/>
        <Route path="/admin/eleves/:id" element={<PrivateRoute><EleveDetail/></PrivateRoute>}/>
        <Route path="/admin/annees" element={<PrivateRoute><AnneesScolaires/></PrivateRoute>}/>
        <Route path="/admin/classes" element={<PrivateRoute><Classes/></PrivateRoute>}/>
        <Route path="/admin/enseignants" element={<PrivateRoute><Enseignants/></PrivateRoute>}/>
        <Route path="/admin/presences" element={<PrivateRoute><Presences/></PrivateRoute>}/>
        <Route path="/admin/notes" element={<PrivateRoute><Notes/></PrivateRoute>}/>
        <Route path="/admin/bulletins" element={<PrivateRoute><Bulletins/></PrivateRoute>}/>
        <Route path="/admin/rapports" element={<PrivateRoute><Rapports/></PrivateRoute>}/>

        {/* ── Enseignant Web ── */}
        <Route path="/enseignant/login"    element={<EnseignantLogin/>}/>
        <Route path="/enseignant/register" element={<EnseignantRegister/>}/>
        <Route path="/enseignant/dashboard" element={<EnseignantRoute><EnseignantDashboard/></EnseignantRoute>}/>
        <Route path="/enseignant/notes"    element={<EnseignantRoute><EnseignantNotes/></EnseignantRoute>}/>
        <Route path="/enseignant/presences" element={<EnseignantRoute><EnseignantPresences/></EnseignantRoute>}/>

        {/* ── Redirections ── */}
        <Route path="/"          element={<Navigate to="/inscription" replace/>}/>
        <Route path="/admin"     element={<Navigate to="/admin/dashboard" replace/>}/>
        <Route path="/enseignant" element={<Navigate to="/enseignant/login" replace/>}/>
        <Route path="*"          element={<Navigate to="/inscription" replace/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
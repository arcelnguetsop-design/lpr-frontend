import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eleveService } from '../../services/eleveService';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { STATUTS_ELEVE, STATUTS_PAIEMENT } from '../../utils/constants';
import {
  ArrowLeft, FileText, CheckCircle, XCircle,
  Phone, Mail, MapPin, School, User, Users
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={14} className="text-blue-600"/>
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <Icon size={16} className="text-blue-600"/>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
    <div className="px-5 py-2">{children}</div>
  </div>
);

const EleveDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [eleve, setEleve]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    eleveService.getById(id)
      .then(data => setEleve(data.eleve))
      .catch(() => toast.error('Élève introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatut = async (newStatut) => {
    setUpdating(true);
    try {
      await eleveService.updateStatut(id, newStatut);
      setEleve(prev => ({ ...prev, statut: newStatut }));
      toast.success(`Statut mis à jour : ${STATUTS_ELEVE[newStatut]}`);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const handlePDF = async () => {
    try {
      await eleveService.getPDF(id);
      toast.success('Fiche PDF téléchargée');
    } catch {
      toast.error('Erreur génération PDF');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    </AdminLayout>
  );

  if (!eleve) return (
    <AdminLayout>
      <div className="text-center py-16 text-gray-400">
        <p>Élève introuvable</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          Retour
        </Button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600"/>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              {eleve.nom} {eleve.prenom}
            </h1>
            <p className="text-sm text-gray-500">{eleve.classe_nom} — {eleve.annee_scolaire}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePDF}>
              <FileText size={14} className="mr-1.5"/> Fiche PDF
            </Button>
            {eleve.statut === 'en_attente' && (
              <Button
                variant="success"
                size="sm"
                loading={updating}
                onClick={() => handleStatut('actif')}
              >
                <CheckCircle size={14} className="mr-1.5"/> Valider
              </Button>
            )}
            {eleve.statut === 'actif' && (
              <Button
                variant="danger"
                size="sm"
                loading={updating}
                onClick={() => handleStatut('inactif')}
              >
                <XCircle size={14} className="mr-1.5"/> Désactiver
              </Button>
            )}
            {eleve.statut === 'inactif' && (
              <Button
                variant="success"
                size="sm"
                loading={updating}
                onClick={() => handleStatut('actif')}
              >
                <CheckCircle size={14} className="mr-1.5"/> Réactiver
              </Button>
            )}
          </div>
        </div>

        {/* Photo + Statuts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-5">
            <img
              src={eleve.photo_url}
              alt={eleve.nom}
              className="w-20 h-24 object-cover rounded-xl border border-gray-100"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${eleve.nom}&background=2563EB&color=fff&size=128`;
              }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{eleve.nom} {eleve.prenom}</h2>
              <p className="text-gray-500 text-sm mb-3">{eleve.etablissement_origine}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={eleve.statut}>
                  {STATUTS_ELEVE[eleve.statut]}
                </Badge>
                <Badge variant={eleve.statut_paiement}>
                  Paiement : {STATUTS_PAIEMENT[eleve.statut_paiement]}
                </Badge>
                <Badge variant="info">
                  {eleve.classe_nom}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Infos élève */}
          <SectionCard title="Informations élève" icon={User}>
            <InfoRow icon={User}   label="Nom complet"        value={`${eleve.nom} ${eleve.prenom}`}/>
            <InfoRow icon={School} label="Date de naissance"  value={formatDate(eleve.date_naissance)}/>
            <InfoRow icon={MapPin} label="Lieu de naissance"  value={eleve.lieu_naissance}/>
            <InfoRow icon={Phone}  label="Téléphone"          value={eleve.telephone}/>
            <InfoRow icon={Phone}  label="WhatsApp"           value={eleve.whatsapp}/>
            {eleve.email && <InfoRow icon={Mail} label="Email" value={eleve.email}/>}
            <InfoRow icon={MapPin} label="Quartier"           value={eleve.quartier}/>
            <InfoRow icon={School} label="Établissement"      value={eleve.etablissement_origine}/>
            <InfoRow icon={School} label="Inscrit le"         value={formatDate(eleve.created_at)}/>
          </SectionCard>

          {/* Infos parent */}
          <div className="space-y-4">
            <SectionCard title="Parent / Responsable" icon={Users}>
              <InfoRow icon={User}   label="Nom"       value={eleve.parent_nom}/>
              <InfoRow icon={Phone}  label="Téléphone" value={eleve.parent_telephone}/>
              <InfoRow icon={Phone}  label="WhatsApp"  value={eleve.parent_whatsapp}/>
              {eleve.parent_email && <InfoRow icon={Mail}   label="Email"    value={eleve.parent_email}/>}
              <InfoRow icon={MapPin} label="Quartier"  value={eleve.parent_quartier}/>
              <InfoRow icon={MapPin} label="Ville"     value={eleve.parent_ville}/>
            </SectionCard>

            {/* Tuteur si applicable */}
            {eleve.tuteur_nom && (
              <SectionCard title="Tuteur" icon={User}>
                <InfoRow icon={User}   label="Nom"       value={eleve.tuteur_nom}/>
                <InfoRow icon={Phone}  label="Téléphone" value={eleve.tuteur_telephone}/>
                <InfoRow icon={Phone}  label="WhatsApp"  value={eleve.tuteur_whatsapp}/>
                <InfoRow icon={MapPin} label="Adresse"   value={eleve.tuteur_adresse}/>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EleveDetail;
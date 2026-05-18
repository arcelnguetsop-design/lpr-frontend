export const API_URL = process.env.REACT_APP_API_URL || 'https://lpr-backend-zz5x.onrender.com/api/v1';

export const STATUTS_ELEVE = {
  en_attente : 'En attente',
  actif      : 'Actif',
  inactif    : 'Inactif',
  archive    : 'Archivé',
};

export const STATUTS_PAIEMENT = {
  paye       : 'Payé',
  en_attente : 'En attente',
  partiel    : 'Partiel',
};

export const STATUTS_ENSEIGNANT = {
  en_attente : 'En attente',
  actif      : 'Actif',
  desactive  : 'Désactivé',
};
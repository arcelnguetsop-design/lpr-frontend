import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { eleveService } from '../../services/eleveService';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CheckCircle, Upload, User, Users, Shield, Camera, X } from 'lucide-react';

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
          ${i + 1 <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          {i + 1 <= current - 1 ? '✓' : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`w-12 h-0.5 ${i + 1 < current ? 'bg-blue-600' : 'bg-gray-200'}`}/>
        )}
      </div>
    ))}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
      <Icon size={18} className="text-blue-600"/>
    </div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const Inscription = () => {
  const [step, setStep]               = useState(1);
  const [classes, setClasses]         = useState([]);
  const [hasTuteur, setHasTuteur]     = useState(false);
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [showCamera, setShowCamera]   = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm();

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.classes)).catch(console.error);
  }, []);

  // Démarrer la caméra quand le modal s'ouvre
  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        toast.error('Impossible d\'accéder à la caméra');
        setShowCamera(false);
      });
    }
  }, [showCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo_eleve.jpg', { type: 'image/jpeg' });
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(blob));
      setShowCamera(false);
      stopCamera();
      toast.success('Photo capturée avec succès !');
    }, 'image/jpeg', 0.9);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo trop lourde — maximum 2 Mo');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const nextStep = async () => {
    const fields = step === 1
      ? ['nom', 'prenom', 'date_naissance', 'lieu_naissance', 'telephone', 'whatsapp', 'etablissement_origine', 'quartier', 'classe_id']
      : ['parent_nom', 'parent_telephone', 'parent_whatsapp'];
    const valid = await trigger(fields);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    if (!photoFile) {
      toast.error('La photo est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const photo_url = photoPreview || 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      await eleveService.inscrire({ ...data, photo_url });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E4A] to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600"/>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Inscription soumise !</h2>
        <p className="text-gray-600 text-sm mb-6">
          Votre dossier a été enregistré avec succès. L'administration de La Porte de la Réussite
          vous contactera pour confirmer votre inscription.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 text-left text-sm text-blue-700">
          <p className="font-medium mb-1">Prochaines étapes :</p>
          <ul className="space-y-1 text-xs">
            <li>• Votre dossier est en cours d'examen</li>
            <li>• Vous serez contacté(e) par téléphone ou WhatsApp</li>
            <li>• Préparez les frais d'inscription</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 text-sm text-blue-600 hover:underline"
        >
          Soumettre une autre inscription
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E4A] to-blue-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">LPR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">La Porte de la Réussite</h1>
          <p className="text-blue-200 text-sm mt-1">Formulaire d'inscription — Année 2025-2026</p>
        </div>

        <StepIndicator current={step} total={3}/>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── ÉTAPE 1 — ÉLÈVE ── */}
            {step === 1 && (
              <div>
                <SectionTitle icon={User} title="Informations de l'élève" subtitle="Tous les champs marqués * sont obligatoires"/>

                {/* Photo */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Photo de l'élève <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-4">

                    {/* Aperçu */}
                    <div className="w-20 h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover"/>
                      ) : (
                        <User size={24} className="text-gray-300"/>
                      )}
                    </div>

                    {/* Boutons */}
                    <div className="flex flex-col gap-2">
                      {/* Import fichier */}
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
                          <Upload size={14}/>
                          {photoFile ? 'Changer la photo' : 'Importer une photo'}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden"/>
                      </label>

                      {/* Capture caméra */}
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm text-blue-600"
                      >
                        <Camera size={14}/>
                        Prendre une photo
                      </button>

                      <p className="text-xs text-gray-400">JPG, PNG — max 2 Mo</p>
                    </div>
                  </div>

                  {/* Modal caméra */}
                  {showCamera && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">Prendre une photo</h3>
                          <button
                            type="button"
                            onClick={() => { setShowCamera(false); stopCamera(); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100"
                          >
                            <X size={18} className="text-gray-500"/>
                          </button>
                        </div>

                        <div className="relative bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full"
                            style={{ maxHeight: '320px', objectFit: 'cover' }}
                          />
                          {/* Guide portrait */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border-2 border-white/50 rounded-xl w-32 h-40"/>
                          </div>
                        </div>

                        <canvas ref={canvasRef} className="hidden"/>

                        <div className="p-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setShowCamera(false); stopCamera(); }}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 px-4 py-2.5 bg-blue-600 rounded-xl text-sm text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                          >
                            <Camera size={16}/> Capturer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom" name="nom" register={register} required error={errors.nom} placeholder="MBARGA"/>
                  <Input label="Prénom" name="prenom" register={register} required error={errors.prenom} placeholder="Paul"/>
                  <Input label="Date de naissance" name="date_naissance" type="date" register={register} required error={errors.date_naissance}/>
                  <Input label="Lieu de naissance" name="lieu_naissance" register={register} required error={errors.lieu_naissance} placeholder="Yaoundé"/>
                  <Input label="Téléphone" name="telephone" register={register} required error={errors.telephone} placeholder="677000000"/>
                  <Input label="WhatsApp" name="whatsapp" register={register} required error={errors.whatsapp} placeholder="677000000"/>
                  <Input label="Email (optionnel)" name="email" type="email" register={register} error={errors.email} placeholder="paul@gmail.com"/>
                  <Input label="Quartier" name="quartier" register={register} required error={errors.quartier} placeholder="Bastos"/>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Classe <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('classe_id', { required: 'Classe obligatoire' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choisir une classe</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                    {errors.classe_id && <p className="text-xs text-red-500">⚠ {errors.classe_id.message}</p>}
                  </div>

                  <Input
                    label="Établissement d'origine"
                    name="etablissement_origine"
                    register={register}
                    required
                    error={errors.etablissement_origine}
                    placeholder="Lycée de Ngoa-Ekellé"
                    className="sm:col-span-2"
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={nextStep} size="lg">
                    Suivant →
                  </Button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 — PARENT ── */}
            {step === 2 && (
              <div>
                <SectionTitle icon={Users} title="Informations du parent / responsable"/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom du parent" name="parent_nom" register={register} required error={errors.parent_nom} placeholder="MBARGA Jean" className="sm:col-span-2"/>
                  <Input label="Téléphone" name="parent_telephone" register={register} required error={errors.parent_telephone} placeholder="699000000"/>
                  <Input label="WhatsApp" name="parent_whatsapp" register={register} required error={errors.parent_whatsapp} placeholder="699000000"/>
                  <Input label="Email (optionnel)" name="parent_email" type="email" register={register} error={errors.parent_email} placeholder="parent@gmail.com"/>
                  <Input label="Quartier" name="parent_quartier" register={register} error={errors.parent_quartier} placeholder="Bastos"/>
                  <Input label="Ville" name="parent_ville" register={register} error={errors.parent_ville} placeholder="Yaoundé" className="sm:col-span-2"/>
                </div>

                {/* Tuteur */}
                <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTuteur}
                      onChange={(e) => setHasTuteur(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      L'élève vit avec un tuteur (différent des parents)
                    </span>
                  </label>

                  {hasTuteur && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Input label="Nom du tuteur" name="tuteur_nom" register={register} error={errors.tuteur_nom} placeholder="Nom du tuteur" className="sm:col-span-2"/>
                      <Input label="Téléphone tuteur" name="tuteur_telephone" register={register} error={errors.tuteur_telephone} placeholder="677000000"/>
                      <Input label="WhatsApp tuteur" name="tuteur_whatsapp" register={register} error={errors.tuteur_whatsapp} placeholder="677000000"/>
                      <Input label="Adresse tuteur" name="tuteur_adresse" register={register} error={errors.tuteur_adresse} placeholder="Adresse complète" className="sm:col-span-2"/>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                    ← Retour
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Suivant →
                  </Button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 — CONFIRMATION ── */}
            {step === 3 && (
              <div>
                <SectionTitle icon={Shield} title="Confirmation" subtitle="Vérifiez vos informations avant de soumettre"/>

                <div className="space-y-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-500 font-medium uppercase mb-2">Élève</p>
                    <p className="font-semibold text-gray-800">{getValues('nom')} {getValues('prenom')}</p>
                    <p className="text-sm text-gray-600">{classes.find(c => c.id === getValues('classe_id'))?.nom || '—'}</p>
                    <p className="text-sm text-gray-600">{getValues('etablissement_origine')}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-green-500 font-medium uppercase mb-2">Parent</p>
                    <p className="font-semibold text-gray-800">{getValues('parent_nom')}</p>
                    <p className="text-sm text-gray-600">{getValues('parent_telephone')}</p>
                  </div>
                  {photoPreview && (
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                      <img src={photoPreview} alt="apercu" className="w-12 h-14 object-cover rounded-lg"/>
                      <p className="text-sm text-gray-600">Photo ajoutée ✓</p>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
                  <p className="font-medium mb-1">⚠ Important</p>
                  <p className="text-xs">En soumettant ce formulaire, votre dossier sera examiné par l'administration. Vous serez contacté(e) pour confirmation.</p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                    ← Retour
                  </Button>
                  <Button type="submit" loading={loading} variant="success" size="lg">
                    Soumettre l'inscription
                  </Button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
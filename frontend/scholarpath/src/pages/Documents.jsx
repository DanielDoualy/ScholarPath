import { useState, useEffect, useRef } from "react";
import {
  FolderOpen, FileText, BarChart2, GraduationCap,
  UploadCloud, Trash2, Eye, Plus, X,
} from "lucide-react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import Loader from "../components/Loader";
import InputField from "../components/InputField";
import { documentService } from "../services/documentService";
import { formatDate } from "../utils/formatDate";

const TYPE_LABELS = {
  BULLETIN:    "Bulletin",
  DIPLOME:     "Diplôme",
  ATTESTATION: "Attestation",
  CERTIFICAT:  "Certificat",
  AUTRE:       "Autre",
};
const STATUS_CLASS  = { DECLARED: "badge-declared", DOCUMENTED: "badge-documented", VERIFIED: "badge-verified" };
const STATUS_LABELS = { DECLARED: "Déclaré", DOCUMENTED: "Documenté", VERIFIED: "Vérifié" };

function DocIcon({ type, size = 28 }) {
  const color = "var(--green-dark)";
  if (type === "BULLETIN")  return <BarChart2 size={size} color={color} />;
  if (type === "DIPLOME")   return <GraduationCap size={size} color={color} />;
  return <FileText size={size} color={color} />;
}

export default function Documents() {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ doc_type: "BULLETIN", title: "" });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const load = () =>
    documentService.getDocuments()
      .then((d) => setDocs(d.results ?? d))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", form.doc_type);
    fd.append("title", form.title || file.name);
    await documentService.uploadDocument(fd);
    setFile(null);
    setForm({ doc_type: "BULLETIN", title: "" });
    setShowForm(false);
    load();
    setUploading(false);
  };

  const handleDelete = async (id) => {
    await documentService.deleteDocument(id);
    setDocs((p) => p.filter((d) => d.id !== id));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  if (loading) return <><Topbar title="Documents" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Documents" />
      <div className="page-container">
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <div>
            <p className="page-title">Bibliothèque de preuves</p>
            <p className="page-subtitle">
              Déposez vos bulletins, diplômes et attestations pour enrichir votre profil.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm((p) => !p)}>
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Déposer un document</>}
          </Button>
        </div>

        {/* Upload form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">Nouveau document</div>
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Type" id="doc_type" type="select" name="doc_type" value={form.doc_type}
                  onChange={(e) => setForm((p) => ({ ...p, doc_type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </InputField>
                <InputField label="Titre (optionnel)" id="title" name="title" value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex : Bulletin T1 2024-2025" />
              </div>

              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragOver ? "var(--green)" : "var(--border-dark)"}`,
                  borderRadius: 10, padding: "32px 20px", textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "var(--green-light)" : "var(--surface)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <UploadCloud size={36} color={dragOver ? "var(--green-dark)" : "var(--text-muted)"} />
                </div>
                {file ? (
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--green-dark)" }}>
                    {file.name} ({(file.size / 1024).toFixed(0)} Ko)
                  </p>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Glissez votre fichier ici</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ou cliquez pour parcourir — PDF, JPEG, PNG — max 10 Mo</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <Button type="submit" variant="primary" loading={uploading} disabled={!file}>
                Téléverser le document
              </Button>
            </form>
          </div>
        )}

        {/* Documents grid */}
        {docs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={26} color="var(--text-muted)" /></div>
              <p style={{ fontWeight: 600 }}>Aucun document déposé</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Déposez vos bulletins et attestations pour améliorer votre score de fiabilité.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {docs.map((doc) => (
              <div key={doc.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Doc icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--green-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <DocIcon type={doc.doc_type} size={24} />
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>{doc.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{formatDate(doc.uploaded_at)}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`badge ${STATUS_CLASS[doc.verification_status]}`}>
                    {STATUS_LABELS[doc.verification_status]}
                  </span>
                  <span className="badge badge-gray">{TYPE_LABELS[doc.doc_type]}</span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                    <Button variant="outline" size="sm" style={{ width: "100%" }}>
                      <Eye size={13} /> Voir
                    </Button>
                  </a>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

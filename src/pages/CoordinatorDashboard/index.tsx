import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ExternalLink, Loader2, LogOut } from "lucide-react";
import { api } from "../../services/api";
import styles from "./styles.module.scss";

interface StudentInfo {
  _id: string;
  name: string;
  email: string;
}

interface PendingCertificate {
  _id: string;
  title: string;
  hours: number;
  fileUrl: string;
  studentId: StudentInfo;
  createdAt: string;
}

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<PendingCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<PendingCertificate[]>(
        "/coordinator/certificates/pending",
      );
      setCertificates(response.data);
    } catch (error) {
      console.error("Erro ao carregar pendentes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendings();
  }, [fetchPendings]);

  const handleEvaluate = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await api.patch(`/coordinator/certificates/${id}/evaluate`, { status });
      setCertificates((prev) => prev.filter((cert) => cert._id !== id));
    } catch (error) {
      console.error(`Erro ao avaliar certificado como ${status}:`, error);
      alert("Ocorreu um erro ao processar a avaliação. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/student/logout");
      localStorage.removeItem("@CertificApp:user");
      navigate("/");
    } catch (error) {
      console.error("Erro ao terminar sessão", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>A carregar certificados pendentes...</p>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("@CertificApp:user") || "{}");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Painel da Coordenação</h1>
          <p>
            Olá, {user.name || "Coordenador"}. Analise as horas complementares
            submetidas.
          </p>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Terminar Sessão"
        >
          <LogOut size={20} />
          Sair
        </button>
      </header>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2>A aguardar validação ({certificates.length})</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Atividade</th>
              <th>Carga Horária</th>
              <th>Documento</th>
              <th className={styles.actionsColumn}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <tr key={cert._id}>
                  <td>
                    <div className={styles.studentInfo}>
                      <strong>{cert.studentId.name}</strong>
                      <span>{cert.studentId.email}</span>
                    </div>
                  </td>
                  <td>{cert.title}</td>
                  <td>{cert.hours}h</td>
                  <td>
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewLink}
                    >
                      <ExternalLink size={16} /> Abrir anexo
                    </a>
                  </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => handleEvaluate(cert._id, "approved")}
                      className={styles.approveBtn}
                      title="Aprovar certificado"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleEvaluate(cert._id, "rejected")}
                      className={styles.rejectBtn}
                      title="Rejeitar certificado"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  <Check size={48} className={styles.allDoneIcon} />
                  <p>
                    Não há certificados pendentes de avaliação neste momento.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

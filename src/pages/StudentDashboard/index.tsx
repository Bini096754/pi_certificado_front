import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Loader2,
  LogOut,
  XCircle,
} from "lucide-react";
import Modal from "../../components/Modal";
import CertificateForm from "../../components/CertificateForm";
import { api } from "../../services/api";
import styles from "./style.module.scss";

interface ICertificate {
  _id: string;
  title: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface IStats {
  totalSent: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalHours: number;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [stats, setStats] = useState<IStats>({
    totalSent: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/dashboard");

      setCertificates(response.data.history);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleNewCertificate = () => {
    setIsModalOpen(false);
    fetchDashboardData(); // Recarrega os dados para atualizar os totais
  };

  const handleLogout = async () => {
    try {
      await api.post("/student/logout");
      localStorage.removeItem("@CertificApp:user");
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>A carregar o seu painel...</p>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("@CertificApp:user") || "{}");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Olá, {user.name?.split(" ")[0] || "Aluno"}! 👋</h1>
          <p>Acompanhe as suas horas complementares.</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            Novo Certificado
          </button>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Terminar Sessão"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FileText size={24} className={styles.iconBlue} />
          <div className={styles.statInfo}>
            <span>Enviados</span>
            <strong>{stats.totalSent}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} className={styles.iconOrange} />
          <div className={styles.statInfo}>
            <span>Pendentes</span>
            <strong>{stats.pendingCount}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle size={24} className={styles.iconGreen} />
          <div className={styles.statInfo}>
            <span>Horas Aprovadas</span>
            <strong>{stats.totalHours}h</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <XCircle size={24} className={styles.iconRed} />
          <div className={styles.statInfo}>
            <span>Rejeitados</span>
            <strong>{stats.rejectedCount}</strong>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2>Histórico de Certificados</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Carga Horária</th>
              <th>Data de Envio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length > 0 ? (
              <CertificateList certificates={certificates} />
            ) : (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  <FileText size={48} />
                  <p>Ainda não enviou nenhum certificado.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Enviar Novo Certificado"
      >
        <CertificateForm onSuccess={handleNewCertificate} />
      </Modal>
    </div>
  );
}

function CertificateList({ certificates }: { certificates: ICertificate[] }) {
  return (
    <>
      {certificates.map((cert) => (
        <tr key={cert._id}>
          <td>{cert.title}</td>
          <td>{cert.hours}h</td>
          <td>{new Date(cert.createdAt).toLocaleDateString("pt-PT")}</td>
          <td>
            <span className={`${styles.badge} ${styles[cert.status]}`}>
              {cert.status === "approved" && "Aprovado"}
              {cert.status === "pending" && "Pendente"}
              {cert.status === "rejected" && "Rejeitado"}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

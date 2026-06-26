export type CertificateStatus = "pending" | "approved" | "rejected";
export interface ICertificate {
  id: string;
  title: string;
  hours: number;
  status: CertificateStatus;
  uploadDate: string;
}

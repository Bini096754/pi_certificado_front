import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { api } from "../../services/api";
import Input from "../Input";
import Button from "../Button";
import styles from "./styles.module.scss";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const schema = zod.object({
  title: zod.string().min(3, "O título é muito curto"),
  hours: zod.coerce
    .number()
    .min(1, "A carga horária deve ser de pelo menos 1 hora"),
  file: zod
    .any()
    .refine((files) => files?.length === 1, "O documento é obrigatório")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "O tamanho máximo permitido é de 5MB",
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Apenas ficheiros PDF, JPG ou PNG são aceites",
    ),
});

// Renomeado de FormData para CertificateFormData para evitar conflito com a API do navegador
type CertificateFormData = zod.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

const CertificateForm: React.FC<Props> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CertificateFormData>({
    resolver: zodResolver(schema),
  });

  // O handleSubmit do react-hook-form injeta o evento como segundo parâmetro
  const onSubmit = async (
    data: CertificateFormData,
    e?: React.BaseSyntheticEvent,
  ) => {
    // Bloqueia explicitamente o reload da página
    if (e) {
      e.preventDefault();
    }

    try {
      // Como estamos a enviar um ficheiro físico, precisamos do objeto nativo FormData
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("hours", String(data.hours));
      formData.append("file", data.file[0]);

      // A instância do Axios trata de anexar os cookies de sessão de forma segura
      await api.post("/student/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess();
      reset();
    } catch (error) {
      console.error("Falha ao enviar o formulário", error);
      alert(
        "Ocorreu um erro ao enviar o certificado. Verifique a sua ligação.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <Input
        label="Título da Atividade/Curso"
        placeholder="Ex: Minicurso de Liderança"
        {...register("title")}
        error={errors.title?.message as string}
      />

      <Input
        label="Carga Horária (horas)"
        type="number"
        placeholder="Ex: 10"
        {...register("hours")}
        error={errors.hours?.message as string}
      />

      <div className={styles.fileInputGroup}>
        <label>Documento Comprovativo</label>
        <div className={styles.fileInputContainer}>
          <input
            type="file"
            {...register("file")}
            accept=".pdf, image/jpeg, image/png, image/jpg"
          />
        </div>
        <span className={styles.hint}>PDF ou Imagem até 5MB</span>
        {errors.file && (
          <span className={styles.error}>{String(errors.file.message)}</span>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "A enviar documento..." : "Enviar para Análise"}
      </Button>
    </form>
  );
};

export default CertificateForm;

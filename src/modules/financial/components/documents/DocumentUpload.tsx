'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentMutations } from '../../hooks/useFinancial';

interface DocumentUploadProps {
  movimentacaoId: string;
  onUploaded?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.webp';

export function DocumentUpload({ movimentacaoId, onUploaded }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { upload } = useDocumentMutations();

  const isUploading = upload.isPending;

  function processFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('O arquivo excede o tamanho maximo de 10MB.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo nao permitido. Use PDF, JPG, PNG ou WebP.');
      return;
    }

    upload.mutate(
      { movimentacaoId, file, documentType: 'documento' },
      {
        onSuccess: () => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onUploaded?.();
        },
      },
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [movimentacaoId],
  );

  return (
    <div
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
        isDragging
          ? 'border-primary-500 bg-primary-500/5'
          : 'border-[var(--color-neutral-300)] hover:border-primary-500 hover:bg-primary-500/5'
      } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      ) : (
        <Upload size={28} className="text-[var(--color-neutral-400)]" />
      )}

      <p className="mt-3 text-sm font-medium text-[var(--color-neutral-700)]">
        {isUploading ? 'Enviando...' : 'Clique ou arraste um arquivo'}
      </p>
      <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
        PDF, JPG, PNG (max. 10MB)
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}

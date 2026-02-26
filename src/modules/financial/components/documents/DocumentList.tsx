'use client';

import { useState } from 'react';
import { FileText, Image, File, Download, Trash2 } from 'lucide-react';
import { useTransactionDocuments, useDocumentMutations } from '../../hooks/useFinancial';
import { financialService } from '../../services/financial.service';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import type { TransactionDocument } from '../../types/financial.types';

interface DocumentListProps {
  movimentacaoId: string;
  editable?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const base = 1024;
  const exponent = Math.floor(Math.log(bytes) / Math.log(base));
  const value = bytes / Math.pow(base, exponent);

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getFileIcon(tipoArquivo: string) {
  if (tipoArquivo.includes('pdf')) {
    return <FileText size={20} className="text-red-500" />;
  }
  if (tipoArquivo.startsWith('image/')) {
    return <Image size={20} className="text-blue-500" />;
  }
  return <File size={20} className="text-[var(--color-neutral-400)]" />;
}

export function DocumentList({ movimentacaoId, editable = false }: DocumentListProps) {
  const { data: documents, isLoading } = useTransactionDocuments(movimentacaoId);
  const { remove } = useDocumentMutations();

  const [deleteTarget, setDeleteTarget] = useState<TransactionDocument | null>(null);

  async function handleDownload(filePath: string) {
    const url = await financialService.getDocumentUrl(filePath);
    window.open(url, '_blank');
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    remove.mutate(
      { docId: deleteTarget.id, filePath: deleteTarget.caminho_arquivo },
      {
        onSuccess: () => setDeleteTarget(null),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[var(--color-neutral-400)]">
        Nenhum documento anexado
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-[var(--color-neutral-100)]">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-3 py-3">
            {/* Icone do arquivo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-neutral-50)]">
              {getFileIcon(doc.tipo_arquivo)}
            </div>

            {/* Info do arquivo */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-neutral-800)]">
                {doc.nome_arquivo}
              </p>
              <p className="text-xs text-[var(--color-neutral-400)]">
                {formatFileSize(doc.tamanho_arquivo)}
              </p>
            </div>

            {/* Acoes */}
            {editable && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
                  title="Baixar"
                  onClick={() => handleDownload(doc.caminho_arquivo)}
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-[var(--color-neutral-400)] transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Excluir"
                  onClick={() => setDeleteTarget(doc)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Dialog de confirmacao de exclusao */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(value) => {
          if (!value) setDeleteTarget(null);
        }}
        title="Excluir documento"
        description={`Tem certeza que deseja excluir "${deleteTarget?.nome_arquivo}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={remove.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

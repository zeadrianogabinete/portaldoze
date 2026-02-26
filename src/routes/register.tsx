import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/shared/services/auth.service';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        nome_completo: data.full_name,
        telefone: data.phone,
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4">
        <div className="max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-[var(--color-success)]" strokeWidth={1.5} />
          <h2 className="font-heading text-xl font-bold text-[var(--color-neutral-800)]">
            Cadastro realizado!
          </h2>
          <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Aguarde a aprovação de um administrador. Você será notificado quando seu acesso for liberado.
          </p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Ir para login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/LOGO.png"
            alt="Logo Zé Adriano"
            className="mb-3 h-14 w-auto"
          />
          <p className="text-sm text-[var(--color-neutral-500)]">
            Solicitar acesso ao sistema
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
                Nome completo *
              </label>
              <input
                id="full_name"
                type="text"
                {...register('full_name')}
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
              />
              {errors.full_name && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg_email" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
                Email *
              </label>
              <input
                id="reg_email"
                type="email"
                {...register('email')}
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.email.message}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
                Telefone
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="(00) 00000-0000"
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="reg_password" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
                Senha *
              </label>
              <div className="relative">
                <input
                  id="reg_password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 pr-10 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.password.message}</p>}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
                Confirmar senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.confirmPassword.message}</p>}
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus size={18} strokeWidth={1.5} />
                  Solicitar cadastro
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[var(--color-neutral-400)]">
            Já tem acesso?{' '}
            <a href="/login" className="text-primary-500 hover:underline">
              Fazer login
            </a>
          </p>

          {/* Faixas amarela + verde */}
          <div className="absolute bottom-0 left-0 w-full">
            <div className="h-1 w-full bg-[var(--color-accent-yellow)]" />
            <div className="h-1 w-full bg-[var(--color-accent-green)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

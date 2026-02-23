import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/shared/hooks/useAuth';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate({ to: '/' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      if (message.includes('Invalid login')) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Painel decorativo (desktop) */}
      <div className="hidden flex-1 items-center justify-center bg-primary-500 lg:flex">
        <div className="text-center text-white">
          <h1 className="font-heading text-4xl font-extrabold">Mandato</h1>
          <p className="mt-2 text-lg text-primary-200">
            Sistema de Gestão Parlamentar
          </p>
          <p className="mt-1 text-sm text-primary-300">
            Dep. Federal Zé Adriano — Acre
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center bg-[var(--surface-page)] px-4">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-heading text-2xl font-bold text-primary-500">
              Mandato
            </h1>
            <p className="text-sm text-[var(--color-neutral-500)]">
              Dep. Zé Adriano
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
            <h2 className="font-heading text-xl font-bold text-[var(--color-neutral-800)]">
              Entrar
            </h2>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              Acesse o sistema de gestão do mandato
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors placeholder:text-[var(--color-neutral-400)] focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className="h-10 w-full rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 pr-10 text-sm text-[var(--color-neutral-800)] outline-none transition-colors placeholder:text-[var(--color-neutral-400)] focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">
                    {errors.password.message}
                  </p>
                )}
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
                    <LogIn size={18} strokeWidth={1.5} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[var(--color-neutral-400)]">
              Esqueceu a senha? Entre em contato com o administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const session = useAuthStore();
  const notify = useUiStore((s) => s.notify);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      session.setSession(data);
      navigate("/");
    },
    onError: () => notify("Login failed")
  });

  if (session.user) return <Navigate to="/" replace />;

  return (
    <Stack component="form" spacing={2.4} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <Typography variant="h5">Welcome back</Typography>
      <TextField label="Email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
      <TextField label="Password" type="password" {...form.register("password")} error={!!form.formState.errors.password} helperText={form.formState.errors.password?.message} />
      <Button size="large" variant="contained" type="submit" disabled={mutation.isPending}>
        Sign in
      </Button>
      <Stack direction="row" justifyContent="space-between">
        <Link component={RouterLink} to="/forgot-password">
          Forgot password
        </Link>
        <Link component={RouterLink} to="/register">
          Create account
        </Link>
      </Stack>
    </Stack>
  );
}

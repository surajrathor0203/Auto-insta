import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession(data);
      navigate("/");
    }
  });
  return (
    <Stack component="form" spacing={2.4} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <Typography variant="h5">Create workspace</Typography>
      <TextField label="Name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />
      <TextField label="Email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
      <TextField label="Password" type="password" {...form.register("password")} error={!!form.formState.errors.password} helperText={form.formState.errors.password?.message} />
      <Button size="large" variant="contained" type="submit" disabled={mutation.isPending}>
        Create account
      </Button>
      <Link component={RouterLink} to="/login">
        Already have an account?
      </Link>
    </Stack>
  );
}

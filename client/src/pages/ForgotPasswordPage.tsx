import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "../api/auth";
import { useUiStore } from "../store/uiStore";

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const notify = useUiStore((s) => s.notify);
  const form = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const mutation = useMutation({ mutationFn: ({ email }: { email: string }) => authApi.forgotPassword(email), onSuccess: () => notify("Reset link generated") });
  return (
    <Stack component="form" spacing={2.4} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <Typography variant="h5">Reset password</Typography>
      <TextField label="Email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
      <Button size="large" variant="contained" type="submit" disabled={mutation.isPending}>
        Send reset link
      </Button>
    </Stack>
  );
}

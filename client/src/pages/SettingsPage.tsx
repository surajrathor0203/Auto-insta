import { Button, Chip, Grid2, Paper, Stack, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkIcon from "@mui/icons-material/Link";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/resources";

export function SettingsPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: api.accounts });

  async function connectInstagram() {
    const { url } = await api.instagramOAuth();
    window.location.href = url;
  }

  return (
    <Grid2 container spacing={2.5}>
      <Grid2 size={{ xs: 12, md: 5 }}>
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <InstagramIcon color="primary" sx={{ fontSize: 42 }} />
            <Typography variant="h5">Instagram Business accounts</Typography>
            <Typography color="text.secondary">Connect multiple Meta Instagram Business accounts and select them when creating posts.</Typography>
            <Button variant="contained" startIcon={<LinkIcon />} onClick={connectInstagram}>
              Connect Instagram
            </Button>
          </Stack>
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h5" mb={2}>Connected accounts</Typography>
          <Stack spacing={1.5}>
            {accounts.map((account) => (
              <Paper key={account._id} variant="outlined" sx={{ p: 2, bgcolor: "transparent" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack>
                    <Typography fontWeight={800}>@{account.username}</Typography>
                    <Typography variant="body2" color="text.secondary">Instagram ID {account.instagramId}</Typography>
                  </Stack>
                  <Chip color={account.status === "connected" ? "success" : "default"} label={account.status} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid2>
    </Grid2>
  );
}

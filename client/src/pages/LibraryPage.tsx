import { Box, Button, Chip, Grid2, Paper, Stack, Typography } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/resources";
import { useUiStore } from "../store/uiStore";
import type { Post } from "../types";

const statusColor: Record<Post["status"], "default" | "primary" | "success" | "error" | "warning"> = {
  pending: "default",
  scheduled: "primary",
  publishing: "warning",
  published: "success",
  failed: "error"
};

export function LibraryPage() {
  const queryClient = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: api.posts });

  const deleteMutation = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      notify("Post deleted");
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: api.duplicatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      notify("Post duplicated");
    }
  });

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4">Content library</Typography>
        <Typography color="text.secondary">All saved posts ready to schedule or publish.</Typography>
      </Stack>
      {isLoading ? (
        <Typography color="text.secondary">Loading posts…</Typography>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <ArticleIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">No posts yet.</Typography>
          <Typography color="text.secondary">Generate content in AI Studio and save it here.</Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={2}>
          {posts.map((post) => (
            <Grid2 key={post._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
                <Stack spacing={1.5} flex={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography fontWeight={700} sx={{ flex: 1 }}>{post.title}</Typography>
                    <Chip size="small" label={post.status} color={statusColor[post.status] ?? "default"} />
                  </Stack>
                  {post.imageUrl && (
                    <Box
                      component="img"
                      src={post.imageUrl}
                      alt=""
                      sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 1 }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1
                    }}
                  >
                    {post.caption}
                  </Typography>
                  {post.hashtags.length > 0 && (
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      {post.hashtags.slice(0, 4).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                      {post.hashtags.length > 4 && <Chip label={`+${post.hashtags.length - 4}`} size="small" />}
                    </Stack>
                  )}
                  <Stack direction="row" gap={1} pt={0.5}>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => duplicateMutation.mutate(post._id)}
                      disabled={duplicateMutation.isPending}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteMutation.mutate(post._id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Stack>
  );
}

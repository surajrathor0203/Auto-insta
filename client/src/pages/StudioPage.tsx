import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid2,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ImageIcon from "@mui/icons-material/Image";
import SaveIcon from "@mui/icons-material/Save";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../api/resources";
import { useUiStore } from "../store/uiStore";

const schema = z.object({
  niche: z.string().min(2),
  trend: z.string().min(2),
  provider: z.enum(["gemini", "stable-diffusion", "huggingface"])
});

type StudioForm = z.infer<typeof schema>;

export function StudioPage() {
  const notify = useUiStore((s) => s.notify);
  const queryClient = useQueryClient();
  const { data: trends = [] } = useQuery({ queryKey: ["trends"], queryFn: api.trends });
  const form = useForm<StudioForm>({
    resolver: zodResolver(schema),
    defaultValues: { niche: "SaaS founders", trend: "", provider: "huggingface" }
  });

  function extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      if (response?.data?.message) return response.data.message;
    }
    return fallback;
  }

  const content = useMutation({ mutationFn: api.generateContent });
  const images = useMutation({ mutationFn: api.generateImages });
  const save = useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      notify("Post saved to library");
    }
  });

  const generated = content.data;
  const generatedImages = images.data ?? [];

  return (
    <Grid2 container spacing={2.5}>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2.5 }}>
          <Stack
            component="form"
            spacing={2.2}
            onSubmit={form.handleSubmit((values) =>
              content.mutate({ niche: values.niche, trend: values.trend })
            )}
          >
            <Typography variant="h5">AI content studio</Typography>
            <TextField label="Audience niche" {...form.register("niche")} error={!!form.formState.errors.niche} helperText={form.formState.errors.niche?.message} />
            <TextField label="Trend" {...form.register("trend")} multiline minRows={3} error={!!form.formState.errors.trend} helperText={form.formState.errors.trend?.message} />
            <TextField label="Image provider" select {...form.register("provider")}>
              <MenuItem value="huggingface">Hugging Face FLUX.1 (Free)</MenuItem>
              <MenuItem value="gemini">Gemini Image</MenuItem>
              <MenuItem value="stable-diffusion">Stable Diffusion (Local)</MenuItem>
            </TextField>
            {content.isError && (
              <Alert severity="error">{extractErrorMessage(content.error, "Failed to generate content. Check your API key and try again.")}</Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={content.isPending ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              disabled={content.isPending}
            >
              {content.isPending ? "Generating content…" : "Generate content"}
            </Button>
            <Button
              variant="outlined"
              startIcon={images.isPending ? <CircularProgress size={16} color="inherit" /> : <ImageIcon />}
              disabled={!generated || images.isPending}
              onClick={() =>
                images.mutate({
                  prompt: generated?.imagePrompt || `${generated?.title}. ${generated?.engagementHook}`,
                  provider: form.getValues("provider"),
                  count: 1,
                  overlayTitle: generated?.title,
                  overlayHook: generated?.engagementHook
                })
              }
            >
              {images.isPending ? "Generating image…" : "Generate image"}
            </Button>
            {images.isError && (
              <Alert severity="error">{extractErrorMessage(images.error, "Failed to generate image. Check your image provider API key.")}</Alert>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, mt: 2 }}>
          <Typography variant="h6" mb={1.5}>Trend queue</Typography>
          <Stack spacing={1}>
            {trends.slice(0, 8).map((trend) => (
              <Button
                key={trend._id}
                sx={{ justifyContent: "space-between" }}
                onClick={() => form.setValue("trend", trend.title)}
              >
                <span>{trend.title.slice(0, 34)}</span>
                <Chip label={trend.score} size="small" />
              </Button>
            ))}
            {trends.length === 0 && (
              <Typography variant="body2" color="text.secondary">No trends loaded yet.</Typography>
            )}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 2.5, minHeight: 560, maxHeight: "80vh", overflow: "auto" }}>
          {generated ? (
            <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4">{generated.title}</Typography>
                  <Typography color="text.secondary" mt={1}>{generated.engagementHook}</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={save.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={save.isPending}
                  onClick={() =>
                    save.mutate({
                      title: generated.title,
                      caption: generated.caption,
                      hashtags: generated.hashtags,
                      imageUrl: generatedImages[0],
                      carouselImages: generatedImages,
                      seoKeywords: generated.seoKeywords,
                      engagementHook: generated.engagementHook,
                      cta: generated.cta,
                      provider: form.getValues("provider")
                    })
                  }
                >
                  {save.isPending ? "Saving…" : "Save to library"}
                </Button>
              </Stack>

              {generated.imagePrompt && (
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="overline" color="text.secondary">Image scene prompt</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>{generated.imagePrompt}</Typography>
                </Box>
              )}

              {images.isPending && (
                <Stack alignItems="center" spacing={1} py={2}>
                  <CircularProgress />
                  <Typography color="text.secondary">Generating image…</Typography>
                </Stack>
              )}

              {generatedImages[0] && !images.isPending && (
                <Box
                  component="img"
                  src={generatedImages[0]}
                  alt=""
                  sx={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 2 }}
                />
              )}

              <Box>
                <Typography variant="overline" color="text.secondary">Caption</Typography>
                <Typography whiteSpace="pre-wrap" mt={0.5}>{generated.caption}</Typography>
              </Box>

              {generated.cta && (
                <Box>
                  <Typography variant="overline" color="text.secondary">CTA</Typography>
                  <Typography mt={0.5}>{generated.cta}</Typography>
                </Box>
              )}

              <Stack direction="row" gap={1} flexWrap="wrap">
                {generated.hashtags.map((tag: string) => <Chip key={tag} label={tag} />)}
              </Stack>

              {generated.carouselContent.length > 0 && (
                <Box>
                  <Typography variant="overline" color="text.secondary">Carousel slides</Typography>
                  <Grid2 container spacing={2} mt={0.5}>
                    {generated.carouselContent.map((slide: string, index: number) => (
                      <Grid2 key={slide} size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "transparent" }}>
                          <Typography variant="overline">Slide {index + 1}</Typography>
                          <Typography>{slide}</Typography>
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                </Box>
              )}

              {generated.seoKeywords.length > 0 && (
                <Box>
                  <Typography variant="overline" color="text.secondary">SEO keywords</Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap" mt={0.5}>
                    {generated.seoKeywords.map((kw: string) => <Chip key={kw} label={kw} size="small" variant="outlined" />)}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : (
            <Stack justifyContent="center" alignItems="center" sx={{ height: 500 }} spacing={1}>
              {content.isPending ? (
                <>
                  <CircularProgress size={48} />
                  <Typography variant="h6" color="text.secondary">Generating your content…</Typography>
                </>
              ) : (
                <>
                  <AutoAwesomeIcon color="primary" sx={{ fontSize: 48 }} />
                  <Typography variant="h5" textAlign="center">Choose a trend and generate your next campaign post.</Typography>
                </>
              )}
            </Stack>
          )}
        </Paper>
      </Grid2>
    </Grid2>
  );
}

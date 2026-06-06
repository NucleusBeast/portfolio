"use client";

import type React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { ProjectImageFrame } from "@/components/project-carousel";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.models.projects.getById, { id: projectId });
  const updateProject = useMutation(api.models.projects.update);
  const generateUploadUrl = useMutation(api.models.projects.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [existingImageIds, setExistingImageIds] = useState<Id<"_storage">[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  useEffect(() => {
    if (!project) {
      return;
    }

    setTitle(project.title);
    setDescription(project.description);
    setUrl(project.url ?? "");
    setGithubUrl(project.githubUrl ?? "");
    setExistingImageIds(project.imageIds);
    setExistingImageUrls(project.imageUrls);
  }, [project]);

  useEffect(() => {
    return () => {
      newPreviewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [newPreviewUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const filesToAdd = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const f of filesToAdd) {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        continue;
      }
      validFiles.push(f);
      validPreviews.push(URL.createObjectURL(f));
    }

    setNewFiles((current) => [...current, ...validFiles]);
    setNewPreviewUrls((current) => [...current, ...validPreviews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImageIds((current) => current.filter((_, i) => i !== index));
    setExistingImageUrls((current) => current.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles((current) => current.filter((_, i) => i !== index));
    setNewPreviewUrls((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    setUploadProgress(0);

    try {
      const uploadedImageIds: Id<"_storage">[] = [];

      if (newFiles.length > 0) {
        let completed = 0;

        await Promise.all(
          newFiles.map(async (file) => {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                "Content-Type": file.type,
              },
              body: file,
            });

            if (!response.ok) {
              throw new Error("Image upload failed");
            }

            const { storageId } = (await response.json()) as {
              storageId: Id<"_storage">;
            };

            uploadedImageIds.push(storageId);
            completed += 1;
            setUploadProgress(Math.round((completed / newFiles.length) * 100));
          }),
        );
      }

      await updateProject({
        id: projectId,
        title,
        description,
        url: url || undefined,
        githubUrl: githubUrl || undefined,
        imageIds: [...existingImageIds, ...uploadedImageIds],
      });

      router.push("/admin/projects");
    } catch {
      setError("Could not update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allPreviewBlocks = useMemo(
    () => [
      ...existingImageUrls.map((previewUrl, index) => ({
        key: `existing-${previewUrl}`,
        previewUrl,
        onRemove: () => removeExistingImage(index),
      })),
      ...newPreviewUrls.map((previewUrl, index) => ({
        key: `new-${previewUrl}`,
        previewUrl,
        onRemove: () => removeNewImage(index),
      })),
    ],
    [existingImageUrls, newPreviewUrls],
  );

  if (project === undefined) {
    return <div className="text-muted-foreground">Loading project...</div>;
  }

  if (project === null) {
    return <div className="text-muted-foreground">Project not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <section className="space-y-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <p className="text-sm text-muted-foreground">Update your project details and images</p>
        </header>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Add Images</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <Button type="button" variant="outline" size="icon" disabled>
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
              {allPreviewBlocks.length > 0 ? (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {allPreviewBlocks.map((item) => (
                    <div
                      key={item.key}
                      className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                    >
                      <ProjectImageFrame
                        src={item.previewUrl}
                        alt="Project image"
                        width={960}
                        height={540}
                        className="pointer-events-none"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2 z-20"
                        onClick={item.onRemove}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Project Link</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Link (optional)</Label>
              <Input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/admin/projects">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

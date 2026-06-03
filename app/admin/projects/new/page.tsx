"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const generateUploadUrl = useMutation(api.models.projects.generateUploadUrl);
  const createProject = useMutation(api.models.projects.create);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles([]);
      setPreviewUrls([]);
      return;
    }

    const nextFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const f of nextFiles) {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        continue;
      }
      validFiles.push(f);
      previews.push(URL.createObjectURL(f));
    }

    setFiles(validFiles);
    setPreviewUrls(previews);
  };

  const removeImageAtIndex = (targetIndex: number) => {
    setFiles((current) => current.filter((_, index) => index !== targetIndex));
    setPreviewUrls((current) => current.filter((_, index) => index !== targetIndex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    setUploadProgress(0);

    try {
      const imageIds: Id<"_storage">[] = [];

      if (files.length > 0) {
        let completed = 0;

        await Promise.all(
          files.map(async (file) => {
            const uploadUrl = await generateUploadUrl();
            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                "Content-Type": file.type,
              },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error("Image upload failed");
            }

            const { storageId } = (await uploadResponse.json()) as {
              storageId: Id<"_storage">;
            };

            imageIds.push(storageId);
            completed += 1;
            setUploadProgress(Math.round((completed / files.length) * 100));
          }),
        );
      }

      await createProject({
        title,
        description,
        url: url || undefined,
        githubUrl: githubUrl || undefined,
        imageIds,
      });

      router.push("/admin/projects");
    } catch {
      setError("Could not create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Add a new project to your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {isSubmitting && uploadProgress > 0 ? (
              <div className="text-sm text-muted-foreground">Uploading images: {uploadProgress}%</div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Cover Image</Label>
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
              {previewUrls.length > 0 ? (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {previewUrls.map((previewUrl, index) => (
                    <div
                      key={previewUrl}
                      className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                    >
                      <Image
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        width={960}
                        height={540}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => removeImageAtIndex(index)}
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
                placeholder="https://example.com/project"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Link (optional)</Label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Link href="/admin/projects">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

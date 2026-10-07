"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  ProjectImageEditor,
  useProjectImages,
} from "@/components/project-image-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.models.projects.getById, { id: projectId });
  const updateProject = useMutation(api.models.projects.update);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const { images, setImages, addFiles, uploadImages } = useProjectImages();
  const [showOnLandingPage, setShowOnLandingPage] = useState(true);
  const loadedProjectId = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!project || loadedProjectId.current === project._id) return;
    loadedProjectId.current = project._id;
    setTitle(project.title);
    setDescription(project.description);
    setUrl(project.url ?? "");
    setGithubUrl(project.githubUrl ?? "");
    setShowOnLandingPage(project.showOnLandingPage ?? true);
    setImages(
      project.images.map((image) => ({
        key: image.imageId,
        imageId: image.imageId,
        previewUrl: image.imageUrl,
      })),
    );
  }, [project, setImages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files, setError);
    event.target.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    setUploadProgress(0);

    try {
      const imageIds = await uploadImages(setUploadProgress);

      await updateProject({
        id: projectId,
        title,
        description,
        url: url || undefined,
        githubUrl: githubUrl || undefined,
        imageIds,
        showOnLandingPage,
      });

      router.push("/admin/projects");
    } catch {
      setError("Could not update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">
            Update your project details and images
          </p>
        </header>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {isSubmitting && uploadProgress > 0 ? (
              <p className="text-sm text-muted-foreground">
                Uploading images: {uploadProgress}%
              </p>
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
                  disabled={isSubmitting}
                />
                <Button type="button" variant="outline" size="icon" disabled>
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
              <ProjectImageEditor
                images={images}
                onChange={setImages}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="showOnLandingPage"
                className="flex items-center gap-2"
              >
                <input
                  id="showOnLandingPage"
                  type="checkbox"
                  checked={showOnLandingPage}
                  onChange={(event) =>
                    setShowOnLandingPage(event.target.checked)
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-primary"
                />
                Show on landing page
              </Label>
              <p className="text-sm text-muted-foreground">
                Hidden projects remain available through their direct link.
              </p>
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

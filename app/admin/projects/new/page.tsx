"use client";

import { useMutation } from "convex/react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import {
  ProjectImageEditor,
  useProjectImages,
} from "@/components/project-image-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const { images, setImages, addFiles, uploadImages } = useProjectImages();
  const [showOnLandingPage, setShowOnLandingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const createProject = useMutation(api.models.projects.create);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files, setError);
    event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    setUploadProgress(0);

    try {
      const imageIds = await uploadImages(setUploadProgress);

      await createProject({
        title,
        description,
        url: url || undefined,
        githubUrl: githubUrl || undefined,
        imageIds,
        showOnLandingPage,
      });

      router.push("/admin/projects");
    } catch {
      setError("Could not create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="text-sm text-muted-foreground">
                Uploading images: {uploadProgress}%
              </div>
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

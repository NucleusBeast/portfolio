"use client";

import { useMutation, useQuery } from "convex/react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const MAX_CV_SIZE = 10 * 1024 * 1024;
const acceptedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CvManagementPage() {
  const cv = useQuery(api.models.cv.get);
  const generateUploadUrl = useMutation(api.models.cv.generateUploadUrl);
  const saveCv = useMutation(api.models.cv.save);
  const removeCv = useMutation(api.models.cv.remove);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setStatus("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!acceptedTypes.includes(selectedFile.type)) {
      setFile(null);
      setError("Upload a PDF, DOC, or DOCX file.");
      return;
    }

    if (selectedFile.size > MAX_CV_SIZE) {
      setFile(null);
      setError("CV file must be 10 MB or smaller.");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setError("Choose a CV file first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("CV upload failed");
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">;
      };

      await saveCv({
        storageId,
        fileName: file.name,
        fileSize: file.size,
      });

      setFile(null);
      setStatus("CV updated.");
    } catch {
      setError("Could not upload CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      await removeCv();
      setStatus("CV removed.");
    } catch {
      setError("Could not remove CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>CV Management</CardTitle>
          <CardDescription>
            Upload the file visitors download from the navbar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {status ? (
            <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
              {status}
            </div>
          ) : null}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md border bg-background p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {cv === undefined
                    ? "Loading current CV..."
                    : cv
                      ? cv.fileName
                      : "No CV uploaded yet"}
                </p>
                {cv ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatFileSize(cv.fileSize)} · Updated{" "}
                    {new Date(cv.uploadedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            </div>

            {cv?.url ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/cv" download={cv.fileName}>
                  <Button type="button" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Current CV
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={handleRemove}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cvFile">Upload new CV</Label>
              <Input
                id="cvFile"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
              {file ? (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({formatFileSize(file.size)})
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Upload CV"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

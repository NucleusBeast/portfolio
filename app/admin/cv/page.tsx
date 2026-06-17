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
const acceptedWordTypes = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const acceptedPagesTypes = [
  "application/vnd.apple.pages",
  "application/x-iwork-pages-sffpages",
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasAcceptedFileType(
  file: File,
  mimeTypes: string[],
  extensions: string[],
) {
  const fileName = file.name.toLowerCase();
  return (
    mimeTypes.includes(file.type) ||
    extensions.some((extension) => fileName.endsWith(extension))
  );
}

export default function CvManagementPage() {
  const cv = useQuery(api.models.cv.get);
  const generateUploadUrl = useMutation(api.models.cv.generateUploadUrl);
  const saveCv = useMutation(api.models.cv.save);
  const saveWordCv = useMutation(api.models.cv.saveWord);
  const savePagesCv = useMutation(api.models.cv.savePages);
  const removeCv = useMutation(api.models.cv.remove);
  const removeWordCv = useMutation(api.models.cv.removeWord);
  const removePagesCv = useMutation(api.models.cv.removePages);

  const [file, setFile] = useState<File | null>(null);
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [pagesFile, setPagesFile] = useState<File | null>(null);
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

    if (
      !hasAcceptedFileType(selectedFile, acceptedTypes, [
        ".pdf",
        ".doc",
        ".docx",
      ])
    ) {
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

  const handleWordFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setStatus("");

    if (!selectedFile) {
      setWordFile(null);
      return;
    }

    if (
      !hasAcceptedFileType(selectedFile, acceptedWordTypes, [".doc", ".docx"])
    ) {
      setWordFile(null);
      setError("Upload a DOC or DOCX file for the Word CV.");
      return;
    }

    if (selectedFile.size > MAX_CV_SIZE) {
      setWordFile(null);
      setError("Word CV file must be 10 MB or smaller.");
      return;
    }

    setError("");
    setWordFile(selectedFile);
  };

  const handlePagesFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setStatus("");

    if (!selectedFile) {
      setPagesFile(null);
      return;
    }

    if (!hasAcceptedFileType(selectedFile, acceptedPagesTypes, [".pages"])) {
      setPagesFile(null);
      setError("Upload a Pages file for the macOS Pages CV.");
      return;
    }

    if (selectedFile.size > MAX_CV_SIZE) {
      setPagesFile(null);
      setError("Pages CV file must be 10 MB or smaller.");
      return;
    }

    setError("");
    setPagesFile(selectedFile);
  };

  const uploadCvFile = async (selectedFile: File) => {
    const uploadUrl = await generateUploadUrl();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": selectedFile.type,
      },
      body: selectedFile,
    });

    if (!uploadResponse.ok) {
      throw new Error("CV upload failed");
    }

    return (await uploadResponse.json()) as {
      storageId: Id<"_storage">;
    };
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
      const { storageId } = await uploadCvFile(file);

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

  const handleWordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wordFile) {
      setError("Choose a Word CV file first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      const { storageId } = await uploadCvFile(wordFile);

      await saveWordCv({
        storageId,
        fileName: wordFile.name,
        fileSize: wordFile.size,
      });

      setWordFile(null);
      setStatus("Word CV updated.");
    } catch {
      setError("Could not upload Word CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagesSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pagesFile) {
      setError("Choose a Pages CV file first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      const { storageId } = await uploadCvFile(pagesFile);

      await savePagesCv({
        storageId,
        fileName: pagesFile.name,
        fileSize: pagesFile.size,
      });

      setPagesFile(null);
      setStatus("Pages CV updated.");
    } catch {
      setError("Could not upload Pages CV. Please try again.");
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

  const handleRemoveWord = async () => {
    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      await removeWordCv();
      setStatus("Word CV removed.");
    } catch {
      setError("Could not remove Word CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePages = async () => {
    setIsSubmitting(true);
    setError("");
    setStatus("");

    try {
      await removePagesCv();
      setStatus("Pages CV removed.");
    } catch {
      setError("Could not remove Pages CV. Please try again.");
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
            Upload the public CV and signed-in editable CV formats.
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

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md border bg-background p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {cv === undefined
                    ? "Loading Pages CV..."
                    : cv?.pagesFileName
                      ? cv.pagesFileName
                      : "No Pages CV uploaded yet"}
                </p>
                {cv?.pagesFileName && cv.pagesFileSize && cv.pagesUploadedAt ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatFileSize(cv.pagesFileSize)} · Updated{" "}
                    {new Date(cv.pagesUploadedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            </div>

            {cv?.pagesUrl && cv.pagesFileName ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/cv/pages" download={cv.pagesFileName}>
                  <Button type="button" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Pages CV
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={handleRemovePages}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Pages
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md border bg-background p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {cv === undefined
                    ? "Loading Word CV..."
                    : cv?.wordFileName
                      ? cv.wordFileName
                      : "No Word CV uploaded yet"}
                </p>
                {cv?.wordFileName && cv.wordFileSize && cv.wordUploadedAt ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatFileSize(cv.wordFileSize)} · Updated{" "}
                    {new Date(cv.wordUploadedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            </div>

            {cv?.wordUrl && cv.wordFileName ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/cv/word" download={cv.wordFileName}>
                  <Button type="button" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Word CV
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={handleRemoveWord}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Word
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

          <form onSubmit={handleWordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wordCvFile">Upload Word CV</Label>
              <Input
                id="wordCvFile"
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleWordFileChange}
              />
              {wordFile ? (
                <p className="text-sm text-muted-foreground">
                  Selected: {wordFile.name} ({formatFileSize(wordFile.size)})
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting || !wordFile || !cv}>
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Upload Word CV"}
            </Button>
          </form>

          <form onSubmit={handlePagesSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pagesCvFile">Upload Pages CV</Label>
              <Input
                id="pagesCvFile"
                type="file"
                accept=".pages,application/vnd.apple.pages,application/x-iwork-pages-sffpages"
                onChange={handlePagesFileChange}
              />
              {pagesFile ? (
                <p className="text-sm text-muted-foreground">
                  Selected: {pagesFile.name} ({formatFileSize(pagesFile.size)})
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting || !pagesFile || !cv}>
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Upload Pages CV"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React from "react"

import { useState } from "react";
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

export default function NewProjectPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [image, setImage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app, save to database
        console.log({ title, description, link, image });
        router.push("/admin/projects");
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
                    <CardDescription>
                        Add a new project to your portfolio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <Label htmlFor="image">Cover Image URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="image"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                />
                                <Button type="button" variant="outline" size="icon">
                                    <ImagePlus className="h-4 w-4" />
                                </Button>
                            </div>
                            {image && (
                                <div className="mt-2 aspect-video overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Project Link</Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://github.com/..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit">Create Project</Button>
                            <Link href="/admin/projects">
                                <Button type="button" variant="outline">
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

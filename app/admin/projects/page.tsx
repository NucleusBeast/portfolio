"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, ImageIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

// Sample data - in real app this would come from a database
const initialProjects: Project[] = [
    {
        id: "1",
        title: "Portfolio Website",
        description: "A modern portfolio built with Next.js",
        image: "",
        link: "https://example.com",
    },
    {
        id: "2",
        title: "E-commerce App",
        description: "Full-stack e-commerce solution",
        image: "",
        link: "https://example.com",
    },
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(initialProjects);

    const handleDelete = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id));
    };

    if (projects.length === 0) {
        return (
            <Empty>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>
                    Create your first project to get started.
                </EmptyDescription>
                <Link href="/admin/projects/new">
                    <Button className="mt-4">Create Project</Button>
                </Link>
            </Empty>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Card key={project.id} className="group overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                        {project.image ? (
                            <img
                                src={project.image || "/placeholder.svg"}
                                alt={project.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link href={`/admin/projects/${project.id}`}>
                                <Button size="sm" variant="secondary">
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(project.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-semibold">{project.title}</h3>
                        {project.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {project.description}
                            </p>
                        )}
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <ExternalLink className="h-3 w-3" />
                                View Project
                            </a>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

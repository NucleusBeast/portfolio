"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
    Trash2,
    Pencil,
    Sparkles,
    Code2,
    Palette,
    Database,
    Wrench,
    Globe,
} from "lucide-react";
import {Empty, EmptyDescription, EmptyTitle} from "@/components/ui/empty";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";

export default function SkillsPage() {

    const skills = useQuery(api.skills.get);
    const deleteSkill = useMutation(api.skills.deleteSkill);

    const getLevelColor = (level: number) => {
        switch (level) {
            case 2:
                return "bg-green-500 text-green-600 hover:bg-green-500/20";
            case 1:
                return "bg-blue-500 text-blue-600 hover:bg-blue-500/20";
            case 0:
                return "bg-orange-500 text-orange-600 hover:bg-orange-500/20";
            default:
                return "bg-red-500 text-orange-600 hover:bg-orange-500/20";
        }
    };

    const getCategoryIcon = (category: string) => {
        const key = category.trim().toLowerCase();

        switch (key) {
            case "frontend":
            case "ui":
            case "design":
                return Palette;

            case "backend":
            case "api":
                return Database;

            case "devops":
            case "tools":
                return Wrench;

            case "web":
                return Globe;

            case "programming":
            case "coding":
            case "language":
                return Code2;

            default:
                return Sparkles; // fallback
        }
    };

    if (skills?.length === 0) {
        return (
            <Empty>
                <EmptyTitle>No skills yet</EmptyTitle>
                <EmptyDescription>
                    Add your first skill to showcase your expertise.
                </EmptyDescription>
                <Link href="/admin/skills/new">
                    <Button className="mt-4">Add Skill</Button>
                </Link>
            </Empty>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {skills?.map((skill) => {
                        const Icon = getCategoryIcon(skill.category);

                        return (
                            <li
                                key={skill._id}
                                className="flex items-center justify-between px-6 py-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary"/>
                                    </div>

                                    <div>
                                        <h3 className="font-medium">{skill.name}</h3>
                                        <p className="text-sm text-muted-foreground">{skill.category}</p>
                                    </div>
                                </div>

                                {/*<div className="flex flex-col items-center gap-2 w-full">*/}
                                {/*    <div className="h-2 w-full max-w-120 rounded-full bg-secondary overflow-hidden">*/}
                                {/*        <div*/}
                                {/*            className="h-full bg-primary transition-all"*/}
                                {/*            style={{width: `${(skill.level / 10) * 100}%`}}*/}
                                {/*        />*/}
                                {/*    </div>*/}

                                {/*    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">*/}
                                {/*            {skill.level} / 10*/}
                                {/*        </span>*/}
                                {/*</div>*/}

                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="flex gap-1">
                                        {Array.from({length: 10}).map((_, i) => {
                                            const filled = i < skill.level;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`h-2 w-6 rounded-full transition-colors ${
                                                        filled ? getLevelColor(skill.level) : "bg-secondary"
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>

                                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                        {skill.level} / 10
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className={getLevelColor(skill.level)}>
                                        {skill.level}
                                    </Badge>

                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/skills/${skill._id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteSkill({id: skill._id})}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}

"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, Sparkles } from "lucide-react";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {createClient} from "@/utils/supabase/client";
import {deleteSkill, getSkills} from "./actions";

let counter = 0;

export default function SkillsPage() {
    counter = 0;
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        fetchSkills().then();
        counter++;
        console.log(`Skills fetched ${counter} times`);
    }, []);

    const fetchSkills = async () => {
        const skills = getSkills();
        setSkills(await skills);
        console.log(skills);
    }

    const handleDelete = (id: string) => {
        setSkills(skills.filter((s) => s.id !== id));
        deleteSkill(id).then();
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "expert":
                return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
            case "intermediate":
                return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
            case "beginner":
                return "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20";
            default:
                return "";
        }
    };

    if (skills.length === 0) {
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
                    {skills.map((skill) => (
                        <li
                            key={skill.id}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{skill.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {skill.category}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className={getLevelColor(skill.level)}>
                                    {skill.level}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Link href={`/admin/skills/${skill.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(skill.id)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

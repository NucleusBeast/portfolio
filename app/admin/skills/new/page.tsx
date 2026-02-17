"use client";

import React from "react"

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {createSkill} from "@/app/admin/skills/actions";

export default function NewSkillPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [level, setLevel] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSkill({name, level, category}).then();
        router.push("/admin/skills");
    };

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href="/admin/skills"
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4"/>
                Back to Skills
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Skill</CardTitle>
                    <CardDescription>
                        Add a skill to showcase your expertise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Skill Name</Label>
                            <Input
                                id="name"
                                placeholder="React, TypeScript, etc."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Proficiency Level</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Frontend">Frontend</SelectItem>
                                    <SelectItem value="Backend">Backend</SelectItem>
                                    <SelectItem value="Database">Database</SelectItem>
                                    <SelectItem value="DevOps">DevOps</SelectItem>
                                    <SelectItem value="Language">Language</SelectItem>
                                    <SelectItem value="Tool">Tool</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit">Add Skill</Button>
                            <Link href="/admin/skills">
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

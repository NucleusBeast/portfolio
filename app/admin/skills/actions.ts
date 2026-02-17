"use server";

import { createClient } from "@/utils/supabase/client";


export async function createSkill(data: { name: string; level: string; category: string;}) {
    const supabase = createClient();

    const { error } = await supabase.from("skills").insert(data);

    if (error) {
        throw new Error(error.message);
    }
}

// get all skills
export async function getSkills(): Promise<Skill[]> {
    const supabase = createClient();

    const { data, error } = await supabase.from("skills").select("*");

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// get skill by id
export async function getSkillById(id: string) {
    const supabase = createClient();

    const { data, error } = await supabase.from("skills").select("*").eq("id", id).single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteSkill(id: string) {
    const supabase = createClient();

    const { error } = await supabase.from("skills").delete().eq("id", id);

    if (error) {
        throw new Error(error.message);
    }
}

export async function updateSkill(id: string, data: { name: string; level: string; category: string }) {
    const supabase = createClient();

    const { error } = await supabase.from("skills").update(data).eq("id", id);

    if (error) {
        throw new Error(error.message);
    }
}
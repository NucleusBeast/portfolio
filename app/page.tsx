"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button"
import {ModeToggle} from "@/components/mode-toggle";
import { Link } from "lucide-react";
import {useEffect, useState} from "react";
import {getSkills} from "@/app/admin/skills/actions";
import {Separator} from "@radix-ui/react-menu";
import { useQuery } from "convex/react";
import {api} from "@/convex/_generated/api";

export default function Home() {

    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        fetchSkills().then();
    }, []);

    const fetchSkills = async () => {
        const skills = getSkills();
        setSkills(await skills);
        console.log(skills);
    }

    const tasks = useQuery(api.tasks.get);

  return (
    <div className={"justify-center items-center flex flex-col gap-4 mt-10"}>
        <h1 className="text-3xl font-bold">NucleusBeast portfolio!</h1>

        <p>Welcome to my portfolio website built with Next.js!</p>


        <p> I am NucleusBeast, a passionate developer and designer.</p>

        <p>Here is a list of programming languages and frameworks im most versed in:</p>

        {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}

        {skills.map((skill, index) => (
            <div key={index}>
                <p>{skill.name} - {skill.level} ({skill.category})</p>
            </div>
        ))}


        <Separator/>

        <p>Here you can see my projects:</p>

        <ul>
            <li>Project 1: Awesome Web App</li>
            <li>Project 2: Mobile Game</li>
            <li>Project 3: Open Source Library</li>
        </ul>

    </div>
  );
}

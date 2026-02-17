"use client";

import {useEffect, useState} from "react";
import {Separator} from "@radix-ui/react-menu";
import { useQuery } from "convex/react";
import {api} from "@/convex/_generated/api";
import {Button} from "@/components/ui/button";

import { useAuthActions } from "@convex-dev/auth/react";

export default function Home() {
    
    const { signIn } = useAuthActions();
    
    useEffect(() => {
    }, []);

    const tasks = useQuery(api.tasks.get);

  return (
    <div className={"justify-center items-center flex flex-col gap-4 mt-10"}>
        <h1 className="text-3xl font-bold">NucleusBeast portfolio!</h1>

        <p>Welcome to my portfolio website built with Next.js!</p>


        <p> I am NucleusBeast, a passionate developer and designer.</p>

        <p>Here is a list of programming languages and frameworks im most versed in:</p>y

        {/*{tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}*/}


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

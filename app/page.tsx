import Image from "next/image";
import { Button } from "@/components/ui/button"
import {ModeToggle} from "@/components/mode-toggle";
import { Link } from "lucide-react";

export default function Home() {
  return (
    <div className={"justify-center items-center flex flex-col gap-4 mt-10"}>
        <h1 className="text-3xl font-bold">NucleusBeast portfolio!</h1>

        <p>Welcome to my portfolio website built with Next.js!</p>


        <p> I am NucleusBeast, a passionate developer and designer.</p>

        <p>Here is a list of programming languages and frameworks im most versed in:</p>

        <ul>
            <li>JavaScript / TypeScript</li>
            <li>React.js / Next.js</li>
            <li>Node.js</li>
            <li>Python</li>
            <li>Django</li>
            <li>HTML / CSS</li>
        </ul>



        <p>Here you can see my projects:</p>

        <ul>
            <li>Project 1: Awesome Web App</li>
            <li>Project 2: Mobile Game</li>
            <li>Project 3: Open Source Library</li>
        </ul>

        <div className="fixed bottom-4 right-4">
            <ModeToggle />
        </div>

    </div>
  );
}

import Image from "next/image";

export default function Home() {
  return (
    <div>
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

        <Image
            src="/logo.png"
            alt="NucleusBeast Profile Picture"
            width={200}
            height={200}
        />
    </div>
  );
}

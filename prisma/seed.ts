import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution built with Next.js, TypeScript, and Stripe integration for payment processing. Features include user authentication, product catalog, shopping cart, and order management.",
    image: "/project1.jpg",
    technologies: ["Next.js", "TypeScript", "Stripe", "Tailwind CSS", "PostgreSQL"],
    github: "https://github.com/yourusername/ecommerce-platform",
    demo: "https://your-ecommerce-demo.vercel.app",
    featured: false,
    status: "completed"
  },
  {
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, user authentication, and team collaboration features. Built with modern React patterns and WebSocket integration.",
    image: "/project2.jpg",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Express"],
    github: "https://github.com/yourusername/task-manager",
    demo: "https://your-task-manager.vercel.app",
    featured: true,
    status: "completed"
  },
  {
    title: "Data Visualization Dashboard",
    description: "An interactive dashboard for visualizing complex datasets with charts, filters, and real-time data updates. Perfect for business intelligence and analytics.",
    image: "/project3.jpg",
    technologies: ["Vue.js", "D3.js", "Python", "FastAPI", "Redis"],
    github: "https://github.com/yourusername/data-dashboard",
    demo: "https://your-dashboard-demo.vercel.app",
    featured: true,
    status: "completed"
  },
  {
    title: "Mobile Fitness App",
    description: "A React Native mobile application for fitness tracking with workout plans, progress monitoring, and social features. Includes offline support and device integration.",
    image: "/project4.jpg",
    technologies: ["React Native", "Expo", "Node.js", "MongoDB", "JWT"],
    github: "https://github.com/yourusername/fitness-app",
    demo: "https://your-fitness-app.expo.dev",
    featured: true,
    status: "completed"
  },
  {
    title: "AI Chat Assistant",
    description: "An intelligent chat assistant powered by OpenAI API with custom knowledge base integration. Features conversation memory and context awareness.",
    image: "/project5.jpg",
    technologies: ["Python", "FastAPI", "OpenAI API", "Vector DB", "Docker"],
    github: "https://github.com/yourusername/ai-chat-assistant",
    demo: "https://your-ai-chat.herokuapp.com",
    featured: true,
    status: "completed"
  },
  {
    title: "Blockchain Voting System",
    description: "A secure and transparent voting system built on Ethereum blockchain with smart contracts. Ensures vote integrity and provides real-time results.",
    image: "/project6.jpg",
    technologies: ["Solidity", "Web3.js", "React", "Truffle", "IPFS"],
    github: "https://github.com/yourusername/blockchain-voting",
    demo: "https://your-voting-dapp.netlify.app",
    featured: true,
    status: "completed"
  },
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing projects
  await prisma.project.deleteMany({});
  
  // Create new projects
  for (const project of projects) {
    const result = await prisma.project.create({
      data: {
        ...project,
        technologies: JSON.stringify(project.technologies)
      }
    });
    console.log(`Created project with id: ${result.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

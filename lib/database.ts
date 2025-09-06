import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string | null;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project functions
export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return projects.map(project => ({
    ...project,
    technologies: JSON.parse(project.technologies)
  }));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return projects.map(project => ({
    ...project,
    technologies: JSON.parse(project.technologies)
  }));
}

export async function getProjectById(id: number): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id }
  });
  
  if (!project) return null;
  
  return {
    ...project,
    technologies: JSON.parse(project.technologies)
  };
}

export async function createProject(data: {
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  github: string;
  demo: string;
  featured?: boolean;
  status?: string;
}): Promise<Project> {
  const project = await prisma.project.create({
    data: {
      ...data,
      technologies: JSON.stringify(data.technologies)
    }
  });
  
  return {
    ...project,
    technologies: JSON.parse(project.technologies)
  };
}

export async function updateProject(id: number, data: Partial<{
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
  status: string;
}>): Promise<Project> {
  // Prepare updateData with correct types for Prisma
  const updateData: {
    title?: string;
    description?: string;
    image?: string;
    technologies?: string;
    github?: string;
    demo?: string;
    featured?: boolean;
    status?: string;
  } = { ...data };

  if (data.technologies) {
    updateData.technologies = JSON.stringify(data.technologies);
  }
  
  const project = await prisma.project.update({
    where: { id },
    data: updateData
  });
  
  return {
    ...project,
    technologies: JSON.parse(project.technologies)
  };
}

export async function deleteProject(id: number): Promise<void> {
  await prisma.project.delete({
    where: { id }
  });
}
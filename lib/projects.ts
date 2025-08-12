export interface Project {
    id: number;
    title: string;
    description: string;
    image?: string;
    technologies: string[];
    github: string;
    demo: string;
    featured?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
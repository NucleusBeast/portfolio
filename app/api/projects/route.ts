import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/database';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, image, technologies, github, demo, featured, status } = body;
    
    if (!title || !description || !github || !demo) {
      return NextResponse.json(
        { error: 'Title, description, github, and demo are required' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(technologies)) {
      return NextResponse.json(
        { error: 'Technologies must be an array' },
        { status: 400 }
      );
    }
    
    const project = await createProject({
      title,
      description,
      image: image || null,
      technologies,
      github,
      demo,
      featured: featured || false,
      status: status || 'completed'
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Tyme Lyne',
      description: 'A web application for tracking time spent on tasks, with a focus on productivity and analytics.',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
      imageUrl: '',
      liveUrl: 'https://tymelyne.vercel.app',
      githubUrl: 'https://github.com/aparr03/tymelyne-website',
    },
    {
      id: 2,
      title: 'Isle of the Undead',
      description: 'A 3D game built in Unity, where players must escape a zombie-infested prison. Uses an advanced wave-based spawn system to create a challenging experience.',
      tags: ['Unity', 'C#', '.NET'],
      imageUrl: '',
      liveUrl: 'https://youtu.be/U7LoJ6oCf_0',
      githubUrl: 'https://github.com/marcdejesus/Isle-of-the-Undead',
    },
    {
      id: 3,
      title: 'Recipe Website',
      description: 'A recipe website that allows users to search recipes based on ingredients, and then save them to their favorites.',
      tags: ['React', 'Supabase', 'Redux', 'Styled Components'],
      imageUrl: '',
      liveUrl: 'https://github.com/marcdejesus/Recipe-Finder',
      githubUrl: 'https://github.com/marcdejesus/Recipe-Finder',
    },
  ];

  return (
    <div className="py-20">
      <div className="container px-4">
        <div className="space-y-2 text-center mb-12">
          <h2 className="text-3xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">Some of my recent work</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden flex flex-col h-full">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> Code
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <a href="https://github.com/marcdejesus" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" /> View More on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Projects;
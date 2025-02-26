import { Card, CardContent } from './ui/card';
import { 
  Code, Database, Globe, Layout, Palette, Zap
} from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      id: 1,
      title: 'Frontend Development',
      icon: <Layout className="h-8 w-8 text-primary" />,
      skills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React'],
    },
    {
      id: 2,
      title: 'Backend Integration',
      icon: <Database className="h-8 w-8 text-primary" />,
      skills: ['REST APIs', 'SQL', 'SQLite', 'Firebase', 'Supabase', 'PostgreSQL'],
    },
    {
      id: 3,
      title: 'Concepts',
      icon: <Zap className="h-8 w-8 text-primary" />,
      skills: ['Object-Oriented Programming', 'Data Structures & Algorithms', 'Agile Methodologies', 'Database Management', 'Web Design'],
    },
    {
      id: 4,
      title: 'Design Tools',
      icon: <Palette className="h-8 w-8 text-primary" />,
      skills: ['Figma',  'Photoshop', 'Adobe Illustrator', 'iMovie', 'Unity', 'Aseperite'],
    },
    {
      id: 5,
      title: 'Programming Languages',
      icon: <Code className="h-8 w-8 text-primary" />,
      skills: ['Python', 'Java', 'C#', 'C', 'JavaScript', 'TypeScript', 'SQL'],
    },
    {
      id: 6,
      title: 'Deployment & CI/CD',
      icon: <Globe className="h-8 w-8 text-primary" />,
      skills: ['Git', 'GitHub Actions', 'Vercel', 'Netlify', 'Docker', 'AWS'],
    },
  ];

  return (
    <div className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="space-y-2 text-center mb-12">
          <h2 className="text-3xl font-bold">My Skills</h2>
          <p className="text-muted-foreground">Technologies I work with</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => (
            <Card key={category.id} className="h-full">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">{category.icon}</div>
                <h3 className="text-xl font-medium text-center mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
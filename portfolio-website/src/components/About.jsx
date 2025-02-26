import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const About = () => {
  return (
    <div className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="space-y-2 text-center mb-12">
          <h2 className="text-3xl font-bold">About Me</h2>
          <p className="text-muted-foreground">Get to know me better</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-medium">
              I'm <span className="text-primary">Marc De Jesus</span>, a passionate Full-stack Developer
            </h3>
            <p className="text-muted-foreground">
              I'm a Full-Stack Developer based in Macomb, MI. I have a passion for software
              development, and earned a Bachelor's degree in Computer Science from Central Michigan University.
            </p>
            <p className="text-muted-foreground">
              With 5 years of experience in the field, I specialize in React, TypeScript, and 
              modern CSS frameworks. I enjoy turning complex problems into simple, beautiful, 
              and intuitive designs.
            </p>
            <p className="text-muted-foreground">
              When I'm not coding, you can find me at the gym, cooking, or spending 
              time with my friends and family.
            </p>
            <Button asChild>
              <a href="/resume.pdf" download>
                <Download className="mr-2 h-4 w-4" /> Download Resume
              </a>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-primary/20 to-background aspect-square flex items-center justify-center text-primary/20">
                <span className="text-6xl font-bold">MD</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
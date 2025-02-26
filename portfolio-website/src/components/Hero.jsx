import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
          <span className="text-primary">Marc De Jesus</span>
        </h1>
        <h2 className="text-2xl md:text-3xl text-muted-foreground">
          Full-stack Developer
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          I enjoy learning new technologies and building projects that make a difference.
        </p>
        <div className="flex gap-4 mt-8">
          <Button size="lg" asChild>
            <a href="#projects">View My Work</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronDown className="animate-bounce" size={32} />
      </a>
    </div>
  );
};

export default Hero;
function Footer() {
  return (
    <footer className="py-8 bg-muted">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-lg">Marc De Jesus</span>
            <p className="text-sm text-muted-foreground">
              Full-stack Developer
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marc De Jesus. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
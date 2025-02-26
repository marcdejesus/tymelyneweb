import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import './App.css';

export default function Home() {
  return (
    
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  )
}

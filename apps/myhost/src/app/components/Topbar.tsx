import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@wiowa-tech-studio/ui';
import { Link } from 'react-router-dom';

export function Topbar() {
  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-secondary-foreground">Wiowa</span>
              <span className="text-primary"> Tech Studio</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="hover:text-muted-foreground transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/mymemory"
              className="hover:text-muted-foreground transition-colors duration-200"
            >
              Memory
            </Link>
            <a
              href="#about"
              className="hover:text-muted-foreground transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-muted-foreground transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="md:hidden text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Hello</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to={'/'}>Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to={'/mymemory'}>Memory</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

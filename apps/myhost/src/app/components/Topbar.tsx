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
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-white">Wiowa</span>
              <span className="text-blue-200"> Tech Studio</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/mymemory"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Memory
            </Link>
            <a
              href="#about"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-blue-200 transition-colors duration-200"
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

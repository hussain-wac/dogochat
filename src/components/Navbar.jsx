import React from "react";
import { useAtom } from "jotai";
import { globalState } from "../jotai/globalState";
import { User, LogOut, Menu, Settings, Shield, Users, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useTheme } from "../components/theme-provider";
import { Loader2, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Navigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useAtom(globalState);
  const { setTheme, theme } = useTheme();

  const handleLogout = () => {
    <Navigate to="/" replace = "/"/>;
    setUser(null);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 backdrop-blur-md supports-backdrop-blur:bg-white/90 dark:supports-backdrop-blur:bg-neutral-900/90 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <img
              src="/dogo.svg"
              alt="Dogochat Logo"
              className="w-10 h-10 filter drop-shadow-md"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
            Dogo<span className="text-orange-500">chat</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Menu className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-l border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col space-y-6 pt-6">
                  {user ? (
                    <>
                      <div className="flex flex-col items-center p-4">
                        <Avatar className="h-20 w-20 mb-3 border-2 border-orange-200 dark:border-orange-800 shadow-md">
                          {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={user.displayName} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{user.displayName}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="px-4 space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2 text-orange-500" />
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2 text-orange-500" />
                          Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2 text-orange-500" />
                          Privacy
                        </Button>
                      </div>
                      
                      <div className="px-4 pt-2">
                        <Button
                          variant="destructive"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <User className="h-8 w-8 text-neutral-400" />
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 text-center">Sign in to access your chats</p>
                      <Button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-1 px-3 h-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                  >
                    <Avatar className="h-8 w-8 border-2 border-orange-200 dark:border-orange-800">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{user.displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 py-2 shadow-lg border border-neutral-200 dark:border-neutral-700">
                  <DropdownMenuLabel className="text-neutral-500 dark:text-neutral-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-3 py-2">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 break-words">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <User className="mr-2 h-4 w-4 text-orange-500" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <MessageSquare className="mr-2 h-4 w-4 text-orange-500" />
                    My Chats
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Settings className="mr-2 h-4 w-4 text-orange-500" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 cursor-pointer px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 mr-2">
                Sign In
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2 rounded-full bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-orange-500 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-orange-500 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px] shadow-lg border border-neutral-200 dark:border-neutral-700">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={`cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center ${theme === 'light' ? 'text-orange-500 font-medium' : ''}`}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={`cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center ${theme === 'dark' ? 'text-orange-500 font-medium' : ''}`}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={`cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center ${theme === 'system' ? 'text-neutral-700 dark:text-neutral-300 font-medium' : ''}`}
              >
                <Settings className="mr-2 h-4 w-4" />
                System
                {theme === 'system' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
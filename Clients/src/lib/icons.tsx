/** Curated icon set (keeps the bundle small). Names are stored in the database and picked in the dashboard. */
import {
  Activity, Award, BookOpen, Boxes, BrainCircuit, Briefcase, Building2, Code2, Compass, Cpu, Database,
  FlaskConical, Flag, Footprints, Globe, GraduationCap, Guitar, Heart, Home, Landmark, Laptop,
  LayoutTemplate, Lightbulb, Lock, Mail, MapPin, Medal, Mic, Music, Palette, Pencil, Phone,
  Piano, Presentation, Rocket, Server, Shield, ShieldCheck, Smartphone, Sparkles, Star, Terminal, Trophy,
  Users, Wrench, Zap, Camera, Coffee, Dumbbell, Film, Gamepad2, Leaf, Mountain, Plane, Send,
  MessageCircle, Layers, GitBranch, Network, Radar, Bug, KeyRound, Fingerprint, Cloud,
  Bot, LineChart, Handshake, Megaphone, Newspaper, ScrollText, Church, Sun, Moon, Bike, Timer, Target,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  Activity, Award, BookOpen, Boxes, BrainCircuit, Briefcase, Building2, Code2, Compass, Cpu, Database,
  FlaskConical, Flag, Footprints, Globe, GraduationCap, Guitar, Heart, Home, Landmark, Laptop,
  LayoutTemplate, Lightbulb, Lock, Mail, MapPin, Medal, Mic, Music, Palette, Pencil, Phone,
  Piano, Presentation, Rocket, Server, Shield, ShieldCheck, Smartphone, Sparkles, Star, Terminal, Trophy,
  Users, Wrench, Zap, Camera, Coffee, Dumbbell, Film, Gamepad2, Leaf, Mountain, Plane, Send,
  MessageCircle, Layers, GitBranch, Network, Radar, Bug, KeyRound, Fingerprint, Cloud,
  Bot, LineChart, Handshake, Megaphone, Newspaper, ScrollText, Church, Sun, Moon, Bike, Timer, Target,
}

export const ICON_NAMES = Object.keys(ICONS).sort()

export function Icon({ name, size = 16, className, strokeWidth = 1.8 }: { name?: string; size?: number; className?: string; strokeWidth?: number }) {
  const C = (name && ICONS[name]) || Sparkles
  return <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
